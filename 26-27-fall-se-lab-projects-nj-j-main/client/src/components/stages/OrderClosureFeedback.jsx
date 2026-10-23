import React, { useState } from 'react';
import {
  Star,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  MessageSquare,
  ThumbsUp,
  ArrowRight,
  Archive
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { STAGES, normalizeStage } from '../../utils/stageConstants';

export const OrderClosureFeedback = () => {
  const {
    jobOrders,
    feedbackList,
    recordFeedback,
    createQuote,
    setSelectedQuoteForModal,
    setActiveTab,
  } = useApp();

  const deliveredJobs = jobOrders.filter(j => normalizeStage(j.current_stage) === STAGES.COMPLETED);
  const [selectedJobTicket, setSelectedJobTicket] = useState(deliveredJobs[0]?.job_ticket_number || '');
  const [ratingStars, setRatingStars] = useState(5);
  const [feedbackNotes, setFeedbackNotes] = useState('Excellent color registration and on-time delivery! We look forward to ordering again.');

  const handleRecordFeedbackSubmit = (e) => {
    e.preventDefault();
    const job = jobOrders.find(j => j.job_ticket_number === selectedJobTicket);
    if (!job) return;

    recordFeedback(selectedJobTicket, job.customer_name, ratingStars, feedbackNotes);
    setFeedbackNotes('');
  };

  const handleCreateRepeatOrder = (job) => {
    const newQuote = createQuote({
      customer_id: job.customer_id,
      customer_name: job.customer_name,
      contact_person: 'Repeat Order',
      priority: 'Normal',
      raw_material_cost: 15000,
      waste_margin_percent: 8,
      waste_margin_cost: 1200,
      press_runtime_cost: 4500,
      finishing_cost: 2500,
      rush_surcharge_amount: 0,
      total_estimated_price: 25000,
      advance_required_percent: 60,
      advance_collected_amount: 0,
      valid_until: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString().split('T')[0],
      items: [
        {
          id: `qi-rep-${Date.now()}`,
          job_title: `[Repeat] ${job.job_title}`,
          print_category: 'Repeat Print Run',
          print_quantity: job.print_quantity,
          paper_type: job.paper_details,
          paper_gsm: 130,
          sheet_size: '23" x 36"',
          color_pages_front: 4,
          color_pages_back: 4,
          finishing_specs: job.finishing_spec,
          item_subtotal: 25000,
        }
      ]
    });

    setSelectedQuoteForModal(newQuote);
  };

  return (
    <div className="stage-page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Stage 10: Order Closure, Customer Feedback (CSAT) & Re-Order Hub</h1>
          <p className="page-subtitle">
            Formal order sign-off, recording 5-star customer satisfaction reviews, archival, and 1-click repeat re-order template generation.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-primary" onClick={() => setActiveTab('reports')}>
            Go to Stage 11: Reports & Analytics <ArrowRight size={14} className="inline" />
          </button>
        </div>
      </div>

      <div className="feedback-two-col-layout">
        {/* Left: Feedback Intake Form */}
        <div className="card flex-1">
          <div className="card-header">
            <h3 className="card-title flex items-center gap-2">
              <Star size={18} className="text-warning" /> Customer Feedback & Formal Order Closure
            </h3>
            <span className="badge badge-success">CSAT Metrics</span>
          </div>

          <form onSubmit={handleRecordFeedbackSubmit} className="p-4">
            <div className="form-group">
              <label>Select Delivered Job Ticket to Close:</label>
              <select
                className="form-control"
                value={selectedJobTicket || deliveredJobs[0]?.job_ticket_number || ''}
                onChange={(e) => setSelectedJobTicket(e.target.value)}
                required
              >
                {deliveredJobs.length === 0 ? (
                  <option value="">No delivered jobs waiting for feedback sign-off</option>
                ) : (
                  deliveredJobs.map(j => (
                    <option key={j.id} value={j.job_ticket_number}>
                      {j.job_ticket_number} — {j.customer_name} ({j.job_title})
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Interactive 5-Star Rating Selector */}
            <div className="form-group">
              <label className="block mb-1">Customer Satisfaction Rating (1 to 5 Stars):</label>
              <div className="star-rating-row">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    className={`star-btn ${ratingStars >= star ? 'star-active' : 'star-inactive'}`}
                    onClick={() => setRatingStars(star)}
                  >
                    ★
                  </button>
                ))}
                <span className="ml-2 font-bold text-sm text-warning">
                  {ratingStars} / 5 Stars ({ratingStars === 5 ? 'Excellent / Delighted' : (ratingStars === 4 ? 'Good Quality' : 'Satisfactory')})
                </span>
              </div>
            </div>

            <div className="form-group">
              <label>Customer Review Comments & Experience:</label>
              <textarea
                className="form-control"
                rows="3"
                value={feedbackNotes}
                onChange={(e) => setFeedbackNotes(e.target.value)}
                placeholder="Enter customer feedback notes regarding print quality, delivery speed, packing..."
                required
              ></textarea>
            </div>

            <button
              type="submit"
              className="btn btn-success w-full mt-2 py-2 font-bold flex items-center justify-center gap-2"
              disabled={deliveredJobs.length === 0}
            >
              <CheckCircle2 size={18} /> Record Feedback & Formally Archive Order
            </button>
          </form>
        </div>

        {/* Right: Feedback History & Re-Order Templates */}
        <div className="card w-1/3">
          <div className="card-header">
            <h3 className="card-title flex items-center gap-2">
              <ThumbsUp size={18} className="text-primary" /> Past Customer Reviews & Re-Orders
            </h3>
          </div>

          <div className="feedback-list-wrapper">
            {feedbackList.map(fb => (
              <div key={fb.id} className="feedback-card-item text-xs">
                <div className="flex justify-between items-center">
                  <span className="ticket-tag font-bold">{fb.job_ticket_number}</span>
                  <div className="text-warning font-bold">
                    {'★'.repeat(fb.rating_stars)}{'☆'.repeat(5 - fb.rating_stars)}
                  </div>
                </div>
                <div className="font-semibold text-xs mt-1">{fb.customer_name}</div>
                <p className="text-xxs text-slate-700 mt-1 italic bg-slate-50 p-2 rounded border">
                  "{fb.feedback_notes}"
                </p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xxxs text-muted">{new Date(fb.created_at).toLocaleDateString()}</span>
                  <button
                    className="btn btn-xxs btn-primary flex items-center gap-1"
                    onClick={() => {
                      const job = jobOrders.find(j => j.job_ticket_number === fb.job_ticket_number);
                      if (job) handleCreateRepeatOrder(job);
                    }}
                  >
                    <RotateCcw size={11} /> 1-Click Re-Order
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
