import React, { useReducer, useState, useEffect, useRef } from 'react';
import { Edit, Trash2, Plus, LogOut, DollarSign, Package, Receipt } from 'lucide-react';
import { collection, addDoc, doc, updateDoc, deleteDoc, getDocs, query, where } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase';
import { useToast } from '../context/ToastContext';
import { ItemModal, OtherCostModal } from './Modals';
import { gsap } from 'gsap';


const initialState = {
    items: [],
    otherCosts: [],
    loading: false,
    error: null
};

const actionTypes = {
    SET_LOADING: 'SET_LOADING',
    SET_ERROR: 'SET_ERROR',
    ADD_ITEM: 'ADD_ITEM',
    UPDATE_ITEM: 'UPDATE_ITEM',
    DELETE_ITEM: 'DELETE_ITEM',
    ADD_OTHER_COST: 'ADD_OTHER_COST',
    UPDATE_OTHER_COST: 'UPDATE_OTHER_COST',
    DELETE_OTHER_COST: 'DELETE_OTHER_COST',
    SET_ITEMS: 'SET_ITEMS',
    SET_OTHER_COSTS: 'SET_OTHER_COSTS'
};

function reducer(state, action) {
    switch (action.type) {
        case actionTypes.SET_LOADING:
            return { ...state, loading: action.payload };
        case actionTypes.SET_ERROR:
            return { ...state, error: action.payload };
        case actionTypes.ADD_ITEM:
            return { ...state, items: [...state.items, action.payload] };
        case actionTypes.UPDATE_ITEM:
            return {
                ...state,
                items: state.items.map(item =>
                    item.id === action.payload.id ? action.payload : item
                )
            };
        case actionTypes.DELETE_ITEM:
            return {
                ...state,
                items: state.items.filter(item => item.id !== action.payload)
            };
        case actionTypes.ADD_OTHER_COST:
            return { ...state, otherCosts: [...state.otherCosts, action.payload] };
        case actionTypes.UPDATE_OTHER_COST:
            return {
                ...state,
                otherCosts: state.otherCosts.map(cost =>
                    cost.id === action.payload.id ? action.payload : cost
                )
            };
        case actionTypes.DELETE_OTHER_COST:
            return {
                ...state,
                otherCosts: state.otherCosts.filter(cost => cost.id !== action.payload)
            };
        case actionTypes.SET_ITEMS:
            return { ...state, items: action.payload };
        case actionTypes.SET_OTHER_COSTS:
            return { ...state, otherCosts: action.payload };
        default:
            return state;
    }
}

export default function Dashboard({ user, onLogout }) {
    const [state, dispatch] = useReducer(reducer, initialState);
    const [sortBy, setSortBy] = useState('name');
    const [filterType, setFilterType] = useState('all');

    const [showItemModal, setShowItemModal] = useState(false);
    const [showCostModal, setShowCostModal] = useState(false);

    const [editingItem, setEditingItem] = useState(null);
    const [editingCost, setEditingCost] = useState(null);

    const toast = useToast();

    const dashboardRef = useRef(null);

    // Animation on mount
    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from('.dashboard-header', { y: -30, opacity: 0, duration: 0.8, ease: 'power3.out' });
            gsap.from('.summary-card', {
                y: 30,
                opacity: 0,
                duration: 0.8,
                stagger: 0.1,
                ease: 'power3.out',
                delay: 0.2
            });
            gsap.from('.section-card', {
                y: 30,
                opacity: 0,
                duration: 0.8,
                stagger: 0.2,
                ease: 'power3.out',
                delay: 0.4
            });
        }, dashboardRef);
        return () => ctx.revert();
    }, []);

    useEffect(() => {
        const loadUserData = async (userId) => {
            try {
                dispatch({ type: actionTypes.SET_LOADING, payload: true });

                const itemsQuery = query(collection(db, 'items'), where('userId', '==', userId));
                const itemsSnapshot = await getDocs(itemsQuery);
                const items = itemsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                dispatch({ type: actionTypes.SET_ITEMS, payload: items });

                const costsQuery = query(collection(db, 'otherCosts'), where('userId', '==', userId));
                const costsSnapshot = await getDocs(costsQuery);
                const costs = costsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                dispatch({ type: actionTypes.SET_OTHER_COSTS, payload: costs });

            } catch (error) {
                toast('Error loading data: ' + error.message, 'error');
            } finally {
                dispatch({ type: actionTypes.SET_LOADING, payload: false });
            }
        };

        if (user) {
            loadUserData(user.uid);
        }
    }, [user, toast]);

    const totalItemsCost = state.items.reduce((sum, item) => sum + item.cost, 0);
    const totalOtherCosts = state.otherCosts.reduce((sum, cost) => sum + cost.amount, 0);
    const grandTotal = totalItemsCost + totalOtherCosts;

    const filteredItems = state.items
        .filter(item => {
            if (filterType === 'all') return true;
            if (filterType === 'high') return item.cost > 1000;
            if (filterType === 'medium') return item.cost >= 100 && item.cost <= 1000;
            if (filterType === 'low') return item.cost < 100;
            return true;
        })
        .sort((a, b) => {
            if (sortBy === 'name') return a.name.localeCompare(b.name);
            if (sortBy === 'cost-high') return b.cost - a.cost;
            if (sortBy === 'cost-low') return a.cost - b.cost;
            return 0;
        });

    const handleAddItem = () => {
        setEditingItem(null);
        setShowItemModal(true);
    };

    const handleEditItem = (item) => {
        setEditingItem(item);
        setShowItemModal(true);
    };

    const handleAddOtherCost = () => {
        setEditingCost(null);
        setShowCostModal(true);
    };

    const handleEditOtherCost = (cost) => {
        setEditingCost(cost);
        setShowCostModal(true);
    };

    const handleSaveItem = async (itemData) => {
        try {
            dispatch({ type: actionTypes.SET_LOADING, payload: true });

            if (editingItem) {
                const itemRef = doc(db, 'items', itemData.id);
                await updateDoc(itemRef, {
                    name: itemData.name,
                    cost: itemData.cost,
                    userId: user.uid,
                    updatedAt: new Date()
                });
                dispatch({ type: actionTypes.UPDATE_ITEM, payload: itemData });
                toast('Item updated successfully!', 'success');
            } else {
                const docRef = await addDoc(collection(db, 'items'), {
                    ...itemData,
                    userId: user.uid,
                    createdAt: new Date()
                });
                dispatch({ type: actionTypes.ADD_ITEM, payload: { ...itemData, id: docRef.id } });
                toast('Item added successfully!', 'success');
            }
        } catch (error) {
            toast('Error saving item: ' + error.message, 'error');
        } finally {
            dispatch({ type: actionTypes.SET_LOADING, payload: false });
        }
    };

    const handleDeleteItem = async (itemId) => {
        try {
            await deleteDoc(doc(db, 'items', itemId));
            dispatch({ type: actionTypes.DELETE_ITEM, payload: itemId });
            toast('Item deleted successfully!', 'success');
        } catch (error) {
            toast('Error deleting item: ' + error.message, 'error');
        }
    };

    const handleSaveOtherCost = async (costData) => {
        try {
            dispatch({ type: actionTypes.SET_LOADING, payload: true });

            if (editingCost) {
                const costRef = doc(db, 'otherCosts', costData.id);
                await updateDoc(costRef, {
                    description: costData.description,
                    amount: costData.amount,
                    userId: user.uid,
                    updatedAt: new Date()
                });
                dispatch({ type: actionTypes.UPDATE_OTHER_COST, payload: costData });
                toast('Cost updated successfully!', 'success');
            } else {
                const docRef = await addDoc(collection(db, 'otherCosts'), {
                    ...costData,
                    userId: user.uid,
                    createdAt: new Date()
                });
                dispatch({ type: actionTypes.ADD_OTHER_COST, payload: { ...costData, id: docRef.id } });
                toast('Cost added successfully!', 'success');
            }
        } catch (error) {
            toast('Error saving cost: ' + error.message, 'error');
        } finally {
            dispatch({ type: actionTypes.SET_LOADING, payload: false });
        }
    };

    const handleDeleteOtherCost = async (costId) => {
        try {
            await deleteDoc(doc(db, 'otherCosts', costId));
            dispatch({ type: actionTypes.DELETE_OTHER_COST, payload: costId });
            toast('Cost deleted successfully!', 'success');
        } catch (error) {
            toast('Error deleting cost: ' + error.message, 'error');
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            onLogout();
            toast('Logged out successfully!', 'success');
        } catch (error) {
            toast('Error logging out: ' + error.message, 'error');
        }
    };

    return (
        <div className="dashboard" ref={dashboardRef}>
            <div className="dashboard-container">
                <div className="dashboard-header glass-panel" style={{ padding: '20px', borderRadius: '1rem', marginBottom: '30px' }}>
                    <div className="brand">
                        <div className="brand-mark">CT</div>
                        <div>
                            <p className="eyebrow">Budget control</p>
                            <h1>Project Cost Tracker</h1>
                            <p className="subtitle">Keep every cost aligned with your plan.</p>
                        </div>
                    </div>
                    <div className="user-info">
                        <span className="user-pill">Welcome, {user.displayName || user.email}</span>
                        <button onClick={handleLogout} className="btn-logout">
                            <LogOut size={16} />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>

                <div className="summary-cards">
                    <div className="summary-card glass-panel accent-blue">
                        <div className="summary-card-content">
                            <div className="summary-meta">
                                <p>Items Cost</p>
                                <p className="summary-amount">${totalItemsCost.toFixed(2)}</p>
                                <p className="summary-count">{state.items.length} items</p>
                            </div>
                            <div className="summary-icon">
                                <Package size={28} />
                            </div>
                        </div>
                    </div>

                    <div className="summary-card glass-panel accent-green">
                        <div className="summary-card-content">
                            <div className="summary-meta">
                                <p>Other Costs</p>
                                <p className="summary-amount">${totalOtherCosts.toFixed(2)}</p>
                                <p className="summary-count">{state.otherCosts.length} costs</p>
                            </div>
                            <div className="summary-icon">
                                <Receipt size={28} />
                            </div>
                        </div>
                    </div>

                    <div className="summary-card glass-panel accent-purple">
                        <div className="summary-card-content">
                            <div className="summary-meta">
                                <p>Total Project Cost</p>
                                <p className="summary-amount">${grandTotal.toFixed(2)}</p>
                                <p className="summary-count">Grand Total</p>
                            </div>
                            <div className="summary-icon">
                                <DollarSign size={28} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="section-card glass-panel">
                    <div className="section-header">
                        <div className="section-controls">
                            <div>
                                <p className="eyebrow">Tracked assets</p>
                                <h2>Project Items</h2>
                            </div>
                            <div className="controls-group">
                                <select
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value)}
                                >
                                    <option value="all">All Items</option>
                                    <option value="high">High Cost (&gt;$1000)</option>
                                    <option value="medium">Medium Cost ($100-$1000)</option>
                                    <option value="low">Low Cost (&lt;$100)</option>
                                </select>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                >
                                    <option value="name">Sort by Name</option>
                                    <option value="cost-high">Cost: High to Low</option>
                                    <option value="cost-low">Cost: Low to High</option>
                                </select>
                                <button onClick={handleAddItem} className="btn-add">
                                    <Plus size={16} />
                                    <span>Add Item</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="section-content">
                        {filteredItems.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-message">
                                    <p>No items found. Add your first project item to get started!</p>
                                </div>
                            </div>
                        ) : (
                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Cost</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredItems.map((item) => (
                                            <tr key={item.id}>
                                                <td>
                                                    <span>{item.name}</span>
                                                </td>
                                                <td>
                                                    <div className="cost-cell">
                                                        <span>${item.cost.toFixed(2)}</span>
                                                        {item.cost > 1000 && <span className="badge badge-high">High</span>}
                                                        {item.cost >= 100 && item.cost <= 1000 && <span className="badge badge-medium">Medium</span>}
                                                        {item.cost < 100 && <span className="badge badge-low">Low</span>}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="action-buttons">
                                                        <button onClick={() => handleEditItem(item)} className="btn-edit">
                                                            <Edit size={16} />
                                                        </button>
                                                        <button onClick={() => handleDeleteItem(item.id)} className="btn-delete">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                <div className="section-card glass-panel">
                    <div className="section-header">
                        <div className="section-controls">
                            <div>
                                <p className="eyebrow">Additional spend</p>
                                <h2>Other Costs</h2>
                            </div>
                            <button onClick={handleAddOtherCost} className="btn-add btn-add-cost">
                                <Plus size={16} />
                                <span>Add Cost</span>
                            </button>
                        </div>
                    </div>

                    <div className="section-content">
                        {state.otherCosts.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-message">
                                    <p>No other costs added yet. Add shipping, taxes, or other project expenses here!</p>
                                </div>
                            </div>
                        ) : (
                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Description</th>
                                            <th>Amount</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {state.otherCosts.map((cost) => (
                                            <tr key={cost.id}>
                                                <td>
                                                    <span>{cost.description}</span>
                                                </td>
                                                <td>
                                                    <div className="cost-cell">
                                                        <span>${cost.amount.toFixed(2)}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="action-buttons">
                                                        <button onClick={() => handleEditOtherCost(cost)} className="btn-edit">
                                                            <Edit size={16} />
                                                        </button>
                                                        <button onClick={() => handleDeleteOtherCost(cost.id)} className="btn-delete">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <ItemModal
                isOpen={showItemModal}
                onClose={() => setShowItemModal(false)}
                item={editingItem}
                onSave={handleSaveItem}
            />

            <OtherCostModal
                isOpen={showCostModal}
                onClose={() => setShowCostModal(false)}
                cost={editingCost}
                onSave={handleSaveOtherCost}
            />

            {state.loading && (
                <div className="loading-overlay">
                    <div className="loading-content">
                        <div className="loading-spinner"></div>
                        <span>Loading...</span>
                    </div>
                </div>
            )}
        </div>
    );
}
