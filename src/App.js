import React, { useState, useEffect, useReducer } from 'react';
import { Edit, Trash2, Plus, LogOut, DollarSign, Package, Receipt } from 'lucide-react';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, collection, addDoc, doc, updateDoc, deleteDoc, getDocs, query, where } from 'firebase/firestore';
import { app } from './firebase';
import './App.css';

const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Redux-like state management using useReducer
const initialState = {
  items: [],
  otherCosts: [],
  user: null,
  loading: false,
  error: null
};

const actionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_USER: 'SET_USER',
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
    case actionTypes.SET_USER:
      return { ...state, user: action.payload };
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

// Toast notification system
function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 3000);
  };

  const ToastContainer = () => (
    <div className="toast-container">
      {toasts.map(toast => (
        <div 
          key={toast.id}
          className={`toast toast-${toast.type}`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );

  return { toast: addToast, ToastContainer };
}

// Modal component
function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{title}</h2>
          <button onClick={onClose} className="modal-close">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// Authentication Component
function AuthComponent({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const { toast, ToastContainer } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let userCredential;
      if (isLogin) {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } else {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      }
      
      onLogin(userCredential.user);
      toast(isLogin ? 'Logged in successfully!' : 'Account created successfully!', 'success');
    } catch (error) {
      toast(error.message || 'Authentication failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    
    try {
      const result = await signInWithPopup(auth, googleProvider);
      onLogin(result.user);
      toast('Signed in with Google successfully!', 'success');
    } catch (error) {
      toast(error.message || 'Google sign-in failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <ToastContainer />
      <div className="auth-card">
        <div className="auth-header">
          <h1>Project Cost Tracker</h1>
          <p>{isLogin ? 'Sign in to your account' : 'Create a new account'}</p>
        </div>
        
        {/* Google Sign In Button */}
        <button 
          type="button" 
          onClick={handleGoogleSignIn} 
          className="btn-google"
          disabled={loading}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" className="google-icon">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {loading ? 'Please wait...' : 'Continue with Google'}
        </button>

        <div className="auth-divider">
          <span>or</span>
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button 
              type="button" 
              onClick={() => setIsLogin(!isLogin)}
              className="auth-toggle"
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

// Item Form Modal
function ItemModal({ isOpen, onClose, item, onSave }) {
  const [name, setName] = useState('');
  const [cost, setCost] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (item) {
      setName(item.name);
      setCost(item.cost.toString());
    } else {
      setName('');
      setCost('');
    }
  }, [item, isOpen]);

  const handleSave = () => {
    if (!name.trim() || !cost.trim()) {
      toast('Please fill in all fields', 'error');
      return;
    }

    const costNumber = parseFloat(cost);
    if (isNaN(costNumber) || costNumber < 0) {
      toast('Please enter a valid positive number', 'error');
      return;
    }

    onSave({
      id: item ? item.id : Date.now().toString(),
      name: name.trim(),
      cost: costNumber
    });

    onClose();
    setName('');
    setCost('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={item ? 'Edit Item' : 'Add New Item'}>
      <div className="form-group">
        <div>
          <label>Item Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Laptop, Monitor"
          />
        </div>
        <div>
          <label>Cost</label>
          <input
            type="number"
            step="0.01"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            placeholder="0.00"
          />
        </div>
        <div className="form-actions">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button onClick={handleSave} className="btn-primary">
            {item ? 'Update' : 'Add'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// Other Cost Form Modal
function OtherCostModal({ isOpen, onClose, cost, onSave }) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (cost) {
      setDescription(cost.description);
      setAmount(cost.amount.toString());
    } else {
      setDescription('');
      setAmount('');
    }
  }, [cost, isOpen]);

  const handleSave = () => {
    if (!description.trim() || !amount.trim()) {
      toast('Please fill in all fields', 'error');
      return;
    }

    const amountNumber = parseFloat(amount);
    if (isNaN(amountNumber) || amountNumber < 0) {
      toast('Please enter a valid positive number', 'error');
      return;
    }

    onSave({
      id: cost ? cost.id : Date.now().toString(),
      description: description.trim(),
      amount: amountNumber
    });

    onClose();
    setDescription('');
    setAmount('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={cost ? 'Edit Other Cost' : 'Add Other Cost'}>
      <div className="form-group">
        <div>
          <label>Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., Shipping, Tax, Installation"
          />
        </div>
        <div>
          <label>Amount</label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
          />
        </div>
        <div className="form-actions">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button onClick={handleSave} className="btn-primary">
            {cost ? 'Update' : 'Add'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// Main Dashboard Component
function Dashboard({ user, onLogout }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [sortBy, setSortBy] = useState('name');
  const [filterType, setFilterType] = useState('all');
  
  const [showItemModal, setShowItemModal] = useState(false);
  const [showCostModal, setShowCostModal] = useState(false);
  
  const [editingItem, setEditingItem] = useState(null);
  const [editingCost, setEditingCost] = useState(null);
  
  const { toast, ToastContainer } = useToast();

  const loadUserData = async (userId) => {
    try {
      dispatch({ type: actionTypes.SET_LOADING, payload: true });
      
      // Load items
      const itemsQuery = query(collection(db, 'items'), where('userId', '==', userId));
      const itemsSnapshot = await getDocs(itemsQuery);
      const items = itemsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      dispatch({ type: actionTypes.SET_ITEMS, payload: items });
      
      // Load other costs
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

  // Add this useEffect to call loadUserData when user changes
  useEffect(() => {
    if (user) {
      loadUserData(user.uid);
    }
  }, [user]);

  // Calculate totals
  const totalItemsCost = state.items.reduce((sum, item) => sum + item.cost, 0);
  const totalOtherCosts = state.otherCosts.reduce((sum, cost) => sum + cost.amount, 0);
  const grandTotal = totalItemsCost + totalOtherCosts;

  // Filter and sort items
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

  // Event handlers
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
    <div className="dashboard">
      <ToastContainer />
      
      <div className="dashboard-container">
        {/* Header */}
        <div className="dashboard-header">
          <h1>Project Cost Tracker</h1>
          <div className="user-info">
            <span>Welcome, {user.displayName || user.email}</span>
            <button onClick={handleLogout} className="btn-logout">
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="summary-cards">
          <div className="summary-card">
            <div className="summary-card-content">
              <div>
                <p>Items Cost</p>
                <p className="summary-amount">${totalItemsCost.toFixed(2)}</p>
                <p className="summary-count">{state.items.length} items</p>
              </div>
              <Package size={32} />
            </div>
          </div>
          
          <div className="summary-card">
            <div className="summary-card-content">
              <div>
                <p>Other Costs</p>
                <p className="summary-amount">${totalOtherCosts.toFixed(2)}</p>
                <p className="summary-count">{state.otherCosts.length} costs</p>
              </div>
              <Receipt size={32} />
            </div>
          </div>
          
          <div className="summary-card">
            <div className="summary-card-content">
              <div>
                <p>Total Project Cost</p>
                <p className="summary-amount">${grandTotal.toFixed(2)}</p>
                <p className="summary-count">Grand Total</p>
              </div>
              <DollarSign size={32} />
            </div>
          </div>
        </div>

        {/* Items Section */}
        <div className="section-card">
          <div className="section-header">
            <div className="section-controls">
              <h2>Project Items</h2>
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

        {/* Other Costs Section */}
        <div className="section-card">
          <div className="section-header">
            <div className="section-controls">
              <h2>Other Costs</h2>
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
                          <span>${cost.amount.toFixed(2)}</span>
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

      {/* Modals */}
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

      {/* Loading Overlay */}
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

// Main App Component
export default function ProjectCostTracker() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (loading) {
    return (
      <div className="app">
        <div className="loading-overlay">
          <div className="loading-content">
            <div className="loading-spinner"></div>
            <span>Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      {!user ? (
        <AuthComponent onLogin={handleLogin} />
      ) : (
        <Dashboard user={user} onLogout={handleLogout} />
      )}
    </div>
  );
}