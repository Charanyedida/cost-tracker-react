import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';

export function Modal({ isOpen, onClose, title, children }) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content glass-panel">
                <div className="modal-header">
                    <h2>{title}</h2>
                    <button onClick={onClose} className="modal-close">
                        ×
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}

export function ItemModal({ isOpen, onClose, item, onSave }) {
    const [name, setName] = useState('');
    const [cost, setCost] = useState('');
    const toast = useToast();

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

export function OtherCostModal({ isOpen, onClose, cost, onSave }) {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const toast = useToast();

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
