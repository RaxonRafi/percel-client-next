'use client';

import { useState } from 'react';
import { api, ApiError } from '@/lib/api';
import { Icon } from '@/components/icon-sprite';

const TOPICS = [
  { value: 'sending', label: 'Sending a parcel' },
  { value: 'tracking', label: 'A delivery in progress' },
  { value: 'courier', label: 'Becoming a courier' },
  { value: 'other', label: 'Something else' },
] as const;

type Topic = (typeof TOPICS)[number]['value'];

const EMPTY = { name: '', email: '', topic: 'sending' as Topic, trackingId: '', message: '' };

export function Contact() {
  const [form, setForm] = useState(EMPTY);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSending(true);
    try {
      await api.sendContactMessage({
        name: form.name,
        email: form.email,
        topic: form.topic,
        // Unknown or empty fields are a 400, so leave it off rather than send ''.
        trackingId: form.trackingId.trim() || undefined,
        message: form.message,
      });
      setSent(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not send your message. Please try again.');
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="section wrap" id="contact" style={{ paddingTop: 0 }}>
      <div className="contact" data-stagger>
        <div className="contact-info on-dark">
          <div className="hero-grid" aria-hidden="true" />
          <span className="eyebrow"><i><Icon name="i-mail" size={10} /></i>Contact us</span>
          <h2 className="h2">Let&apos;s get your parcels moving</h2>
          <p>Questions about shipping, a delivery in progress, or partnering with us? Pick the channel that suits you.</p>

          <div className="channels">
            <button type="button" className="channel" data-open-chat>
              <i><Icon name="i-chat" size={20} /></i>
              <div><b>Chat with Copilot</b><span>Instant answers, around the clock</span></div>
              <Icon name="i-chevron" size={18} />
            </button>
            <a className="channel" href="#contact-form">
              <i><Icon name="i-mail" size={20} /></i>
              <div><b>Email support</b><span>Send us a message with the form</span></div>
              <Icon name="i-chevron" size={18} />
            </a>
            <a className="channel" href="#faq">
              <i><Icon name="i-help" size={20} /></i>
              <div><b>Read the FAQ</b><span>Booking, tracking, claims and more</span></div>
              <Icon name="i-chevron" size={18} />
            </a>
          </div>
        </div>

        <form className="contact-form" id="contact-form" onSubmit={handleSubmit}>
          <div className="row">
            <div className="field">
              <label htmlFor="c-name">Full name</label>
              <input className="input" id="c-name" autoComplete="name" placeholder="Your name" required minLength={2} maxLength={80}
                value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="c-email">Email</label>
              <input className="input" id="c-email" type="email" autoComplete="email" placeholder="you@example.com" required
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
          </div>

          <div className="field">
            <span className="field-label" id="c-topic">What is it about?</span>
            <div className="topics" role="radiogroup" aria-labelledby="c-topic">
              {TOPICS.map((topic) => (
                <label key={topic.value}>
                  <input type="radio" name="topic" value={topic.value} checked={form.topic === topic.value}
                    onChange={() => setForm({ ...form, topic: topic.value })} />
                  <span>{topic.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="field">
            <label htmlFor="c-track">Tracking ID <span className="hint">(optional)</span></label>
            <input className="input" id="c-track" placeholder="TRK-..." maxLength={40}
              value={form.trackingId} onChange={(e) => setForm({ ...form, trackingId: e.target.value })} />
          </div>

          <div className="field">
            <label htmlFor="c-msg">Message</label>
            <textarea className="input" id="c-msg" placeholder="How can we help?" required minLength={10} maxLength={2000}
              value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
          </div>

          {error && <p className="form-error" role="alert">{error}</p>}

          <div className="contact-foot">
            <small>We reply to every message by email.</small>
            <button className="btn dark lg" type="submit" disabled={sending}>
              {sending ? 'Sending…' : 'Send message'} <Icon name="i-arrow" size={15} />
            </button>
          </div>

          {sent && (
            <div className="sent" role="status">
              <i><Icon name="i-check" size={30} /></i>
              <h3>Message sent</h3>
              <p>Thanks for reaching out. We will get back to you by email.</p>
              <button type="button" className="btn line" onClick={() => { setForm(EMPTY); setSent(false); }}>
                Send another
              </button>
            </div>
          )}
        </form>
      </div>
    </section>
  );
}
