import React, { useState } from 'react';
import {
  Users,
  PlusCircle,
  Building,
  Phone,
  Mail,
  CreditCard,
  Search,
  CheckCircle2,
  FileText,
  DollarSign
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const CustomerDirectory = () => {
  const { customers, addCustomer, setSelectedQuoteForModal, setActiveTab } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form state
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [customerType, setCustomerType] = useState('Corporate');
  const [priceSlab, setPriceSlab] = useState('Standard');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gstin, setGstin] = useState('');
  const [creditLimit, setCreditLimit] = useState(100000);
  const [creditPeriod, setCreditPeriod] = useState(30);
  const [address, setAddress] = useState('');

  const filteredCustomers = customers.filter(c =>
    c.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.contact_person.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery)
  );

  const handleAddCustomerSubmit = (e) => {
    e.preventDefault();
    addCustomer({
      company_name: companyName,
      contact_person: contactPerson,
      customer_type: customerType,
      price_slab: priceSlab,
      email: email,
      phone: phone,
      gstin: gstin,
      credit_limit: Number(creditLimit),
      credit_period_days: Number(creditPeriod),
      address: address,
    });
    setShowAddModal(false);
    setCompanyName('');
    setContactPerson('');
    setEmail('');
    setPhone('');
  };

  return (
    <div className="stage-page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Customer Relationship Management (CRM) Directory</h1>
          <p className="page-subtitle">
            Manage Retail, Corporate, and Reseller client portfolios, price discount slabs, credit limits, and outstanding balances.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <PlusCircle size={16} /> Add New Customer
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title flex items-center gap-2">
            <Users size={18} className="text-primary" /> Active Customer Directory ({customers.length})
          </h3>
          <div className="search-input-box">
            <Search size={14} />
            <input
              type="text"
              placeholder="Search company or contact..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="table-responsive">
          <table className="standard-table">
            <thead>
              <tr>
                <th>Company / Client</th>
                <th>Category</th>
                <th>Pricing Slab</th>
                <th>Contact Details</th>
                <th>GSTIN</th>
                <th className="text-right">Credit Limit</th>
                <th className="text-right">Current Balance</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map(cust => {
                const isOverLimit = cust.credit_limit > 0 && cust.current_balance > cust.credit_limit;
                return (
                  <tr key={cust.id}>
                    <td>
                      <div className="font-bold text-sm text-primary">{cust.company_name}</div>
                      <span className="text-xs text-muted">Attn: {cust.contact_person}</span>
                    </td>
                    <td>
                      <span className={`badge ${cust.customer_type === 'Corporate' ? 'badge-primary' : (cust.customer_type === 'Reseller' ? 'badge-info' : 'badge-secondary')}`}>
                        {cust.customer_type}
                      </span>
                    </td>
                    <td className="text-xs font-semibold text-slate-700">{cust.price_slab}</td>
                    <td className="text-xs">
                      <div>{cust.phone}</div>
                      <div className="text-muted text-xxs">{cust.email}</div>
                    </td>
                    <td className="text-xs font-mono text-muted">{cust.gstin || 'Unregistered'}</td>
                    <td className="text-right font-medium text-xs">
                      {cust.credit_limit > 0 ? `₹${cust.credit_limit.toLocaleString()} (${cust.credit_period_days}d)` : 'Cash Only'}
                    </td>
                    <td className="text-right font-bold text-xs">
                      <span className={isOverLimit ? 'text-danger' : (cust.current_balance > 0 ? 'text-warning' : 'text-success')}>
                        ₹{cust.current_balance?.toLocaleString()}
                      </span>
                    </td>
                    <td className="text-right">
                      <button
                        className="btn btn-xs btn-primary"
                        onClick={() => setActiveTab('enquiry')}
                      >
                        + Quote
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal-container max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Register New Customer / Client</h3>
              <button className="modal-close-btn" onClick={() => setShowAddModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAddCustomerSubmit} className="p-4">
              <div className="form-grid-2">
                <div className="form-group">
                  <label>Company / Brand Name:</label>
                  <input
                    type="text"
                    className="form-control"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Contact Person Name:</label>
                  <input
                    type="text"
                    className="form-control"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label>Customer Classification:</label>
                  <select
                    className="form-control"
                    value={customerType}
                    onChange={(e) => setCustomerType(e.target.value)}
                  >
                    <option value="Corporate">Corporate / Enterprise</option>
                    <option value="Reseller">Reseller / Agency</option>
                    <option value="Retail">Retail Walk-in Customer</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Pricing Slab:</label>
                  <select
                    className="form-control"
                    value={priceSlab}
                    onChange={(e) => setPriceSlab(e.target.value)}
                  >
                    <option value="Standard">Standard Retail Rates</option>
                    <option value="Volume Discount (10% Disc)">Volume Discount (10% Disc)</option>
                    <option value="Contract (15% Disc)">Contract Agreement (15% Disc)</option>
                  </select>
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label>Email Address:</label>
                  <input
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number (WhatsApp):</label>
                  <input
                    type="tel"
                    className="form-control"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label>GSTIN (Optional):</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="29ABCDE1234F1Z5"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Credit Limit (₹):</label>
                  <input
                    type="number"
                    className="form-control"
                    value={creditLimit}
                    onChange={(e) => setCreditLimit(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Billing & Delivery Address:</label>
                <textarea
                  className="form-control"
                  rows="2"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter full address..."
                ></textarea>
              </div>

              <div className="modal-actions-footer mt-4">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Customer Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
