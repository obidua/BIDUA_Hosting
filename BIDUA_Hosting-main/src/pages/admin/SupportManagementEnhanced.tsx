import { useState, useEffect } from 'react';
import {
  MessageSquare,
  Search,
  Clock,
  CheckCircle,
  AlertCircle,
  User as UserIcon,
  Send
} from 'lucide-react';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';

interface Ticket {
  id: number;
  ticket_number: string;
  subject: string;
  status: string;
  priority: string;
  department: string;
  user_name: string;
  user_email: string;
  assigned_to?: number;
  assigned_to_name?: string;
  message_count: number;
  created_at: string;
  updated_at: string;
}

interface TicketDetail extends Ticket {
  description: string;
  messages: TicketMessage[];
}

interface TicketMessage {
  id: number;
  message: string;
  is_staff_reply: boolean;
  is_internal_note: boolean;
  created_at: string;
  author_name: string;
}

interface Employee {
  id: number;
  full_name: string;
  email: string;
  role: string;
  active_tickets: number;
}

export function SupportManagementEnhanced() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<TicketDetail | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [assignedFilter, setAssignedFilter] = useState<number | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);

  useEffect(() => {
    loadTickets();
  }, [statusFilter, priorityFilter, assignedFilter]);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (priorityFilter !== 'all') params.append('priority', priorityFilter);
      if (assignedFilter) params.append('assigned_to', assignedFilter.toString());

      const response = await fetch(`http://localhost:8000/api/v1/support/admin/tickets?${params}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
      });
      const data = await response.json();
      setTickets(data);
    } catch (error) {
      console.error('Failed to load tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/support/admin/employees', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
      });
      const data = await response.json();
      setEmployees(data);
    } catch (error) {
      console.error('Failed to load employees:', error);
    }
  };

  const loadTicketDetail = async (ticketId: number) => {
    try {
      setDetailsLoading(true);
      const response = await fetch(`http://localhost:8000/api/v1/support/tickets/${ticketId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
      });
      const data = await response.json();
      setSelectedTicket(data);
    } catch (error) {
      console.error('Failed to load ticket:', error);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleAssignTicket = async (ticketId: number, employeeId: number) => {
    try {
      await fetch(`http://localhost:8000/api/v1/support/admin/tickets/${ticketId}/assign?employee_id=${employeeId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
      });
      alert('Ticket assigned successfully');
      await loadTickets();
      await loadTicketDetail(ticketId);
    } catch (error) {
      console.error('Failed to assign ticket:', error);
      alert('Failed to assign ticket');
    }
  };

  const handleUpdateStatus = async (ticketId: number, newStatus: string) => {
    try {
      await fetch(`http://localhost:8000/api/v1/support/tickets/${ticketId}/status?new_status=${newStatus}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
      });
      alert('Status updated successfully');
      await loadTickets();
      await loadTicketDetail(ticketId);
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update status');
    }
  };

  const handleSendReply = async () => {
    if (!replyMessage.trim() || !selectedTicket) return;

    try {
      await fetch(`http://localhost:8000/api/v1/support/tickets/${selectedTicket.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          message: replyMessage,
          is_internal_note: isInternalNote
        })
      });

      setReplyMessage('');
      setIsInternalNote(false);
      await loadTicketDetail(selectedTicket.id);
    } catch (error) {
      console.error('Failed to send reply:', error);
      alert('Failed to send reply');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-cyan-200 bg-cyan-500/15 border-cyan-500/40';
      case 'in_progress': return 'text-amber-200 bg-amber-500/15 border-amber-500/40';
      case 'closed': return 'text-slate-200 bg-slate-500/15 border-slate-500/40';
      default: return 'text-slate-200 bg-slate-500/15 border-slate-500/40';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
      case 'high': return 'text-rose-200 bg-rose-500/15 border-rose-500/40';
      case 'medium': return 'text-amber-200 bg-amber-500/15 border-amber-500/40';
      case 'low': return 'text-emerald-200 bg-emerald-500/15 border-emerald-500/40';
      default: return 'text-slate-200 bg-slate-500/15 border-slate-500/40';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertCircle className="h-4 w-4" />;
      case 'in_progress': return <Clock className="h-4 w-4" />;
      case 'closed': return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const filteredTickets = tickets.filter((ticket) =>
    ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.ticket_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.user_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openTicketsCount = tickets.filter(ticket => ticket.status === 'open').length;
  const inProgressCount = tickets.filter(ticket => ticket.status === 'in_progress').length;
  const closedCount = tickets.filter(ticket => ticket.status === 'closed').length;
  const unassignedCount = tickets.filter(ticket => !ticket.assigned_to).length;

  const summaryCards = [
    { label: 'Open Tickets', value: openTicketsCount, helper: 'Awaiting response', accent: 'text-rose-600' },
    { label: 'In Progress', value: inProgressCount, helper: 'Handled by agents', accent: 'text-amber-600' },
    { label: 'Closed Today', value: closedCount, helper: 'Resolved cases', accent: 'text-emerald-600' },
    { label: 'Unassigned', value: unassignedCount, helper: 'Needs routing', accent: 'text-slate-500' },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Support Command Center"
        description="Filter queues, drill into customer conversations, and keep SLAs on track."
        actions={
          <button
            onClick={loadTickets}
            className="px-4 py-2 rounded-xl border border-slate-800 text-slate-300 hover:bg-slate-900/70"
          >
            Refresh tickets
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <div key={card.label} className="bg-slate-950/60 rounded-2xl border border-slate-800 shadow-sm p-5">
            <p className="text-sm text-slate-400">{card.label}</p>
            <p className="text-3xl font-semibold text-white mt-1">{card.value}</p>
            <p className={`text-sm mt-2 ${card.accent}`}>{card.helper}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-950/60 rounded-2xl border border-slate-800 shadow-sm">
          <div className="p-6 border-b border-slate-800">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-800 bg-slate-900 text-white rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm placeholder-slate-500"
                >
                  <option value="all">All</option>
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Priority</label>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-800 bg-slate-900 text-white rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm placeholder-slate-500"
                >
                  <option value="all">All</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Assignee</label>
                <select
                  value={assignedFilter || ''}
                  onChange={(e) => setAssignedFilter(e.target.value ? Number(e.target.value) : null)}
                  className="w-full px-4 py-2 border border-slate-800 bg-slate-900 text-white rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm placeholder-slate-500"
                >
                  <option value="">All agents</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.full_name} ({emp.active_tickets} active)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Keyword, ticket #, customer..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-800 bg-slate-900 text-white rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm placeholder-slate-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto"></div>
                <p className="text-slate-500 mt-4">Loading tickets...</p>
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="text-center py-16 text-slate-500">
                <MessageSquare className="h-10 w-10 mx-auto mb-4 text-slate-400" />
                <p>No tickets match the current filters.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-1">
                {filteredTickets.map((ticket) => {
                  const isActive = selectedTicket?.id === ticket.id;
                  return (
                    <button
                      key={ticket.id}
                      onClick={() => loadTicketDetail(ticket.id)}
                      className={`w-full text-left p-4 rounded-2xl border transition hover:border-cyan-500/40 ${
                        isActive ? 'border-cyan-500/40 bg-cyan-500/10' : 'border-slate-800 bg-slate-950/60'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-mono text-slate-400">{ticket.ticket_number}</span>
                          <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(ticket.status)}`}>
                            {getStatusIcon(ticket.status)}
                            <span className="capitalize">{ticket.status.replace('_', ' ')}</span>
                          </span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${getPriorityColor(ticket.priority)}`}>
                            <span className="capitalize">{ticket.priority}</span>
                          </span>
                          {ticket.assigned_to_name && (
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-200 border border-purple-500/40">
                              <UserIcon className="h-3 w-3" />
                              <span>{ticket.assigned_to_name}</span>
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-400">
                          Updated {new Date(ticket.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="text-base font-semibold text-white">{ticket.subject}</h3>
                      <p className="text-sm text-slate-400 mb-3">Customer • {ticket.user_name}</p>
                      <div className="flex items-center text-xs text-slate-400 gap-4">
                        <span>Created {new Date(ticket.created_at).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3.5 w-3.5" />
                          {ticket.message_count} messages
                        </span>
                        <span className="capitalize">{ticket.department}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="bg-slate-950/60 rounded-2xl border border-slate-800 shadow-sm p-6 flex flex-col">
          {detailsLoading ? (
            <div className="flex items-center justify-center flex-1">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-600"></div>
            </div>
          ) : selectedTicket ? (
            <>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-mono text-slate-500">#{selectedTicket.ticket_number}</p>
                  <h2 className="text-2xl font-semibold text-white mt-1">{selectedTicket.subject}</h2>
                  <p className="text-sm text-slate-400 mt-2">
                    {selectedTicket.user_name} • {selectedTicket.user_email}
                  </p>
                  <p className="text-xs text-slate-500">
                    Created {new Date(selectedTicket.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="text-right space-y-2">
                  <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(selectedTicket.status)}`}>
                    {getStatusIcon(selectedTicket.status)}
                    <span className="capitalize">{selectedTicket.status.replace('_', ' ')}</span>
                  </span>
                  <span className={`block px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(selectedTicket.priority)}`}>
                    <span className="capitalize">{selectedTicket.priority} priority</span>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase">Assign to</label>
                  <select
                    value={selectedTicket.assigned_to || ''}
                    onChange={(e) => e.target.value && handleAssignTicket(selectedTicket.id, Number(e.target.value))}
                    className="mt-1 w-full px-3 py-2 border border-slate-800 bg-slate-900 text-white rounded-xl text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 placeholder-slate-500"
                  >
                    <option value="">Unassigned</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.full_name} ({emp.active_tickets} active)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase">Status</label>
                  <select
                    value={selectedTicket.status}
                    onChange={(e) => handleUpdateStatus(selectedTicket.id, e.target.value)}
                    className="mt-1 w-full px-3 py-2 border border-slate-800 bg-slate-900 text-white rounded-xl text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 placeholder-slate-500"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase">Department</label>
                  <div className="mt-1 px-3 py-2 border border-slate-800 rounded-xl text-sm capitalize text-slate-300">
                    {selectedTicket.department}
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 border border-slate-800 rounded-2xl bg-slate-900/60">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-white">
                    <UserIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">{selectedTicket.user_name}</p>
                    <p className="text-xs text-slate-400">{selectedTicket.user_email}</p>
                  </div>
                </div>
                <p className="text-sm text-slate-300 whitespace-pre-line">{selectedTicket.description}</p>
              </div>

              <div className="mt-6 space-y-4 flex-1 overflow-y-auto">
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Conversation</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                  {selectedTicket.messages && selectedTicket.messages.length > 0 ? (
                    selectedTicket.messages.map((message) => (
                      <div
                        key={message.id}
                        className={`p-4 rounded-2xl border text-sm ${
                          message.is_internal_note
                            ? 'bg-purple-500/10 border-purple-500/40'
                            : message.is_staff_reply
                              ? 'bg-cyan-500/10 border-cyan-500/40'
                              : 'bg-slate-900/60 border-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2 text-xs text-slate-400">
                          <div className="flex items-center gap-2">
                            {message.is_internal_note ? (
                              <span className="px-2 py-0.5 bg-purple-500/20 text-purple-200 rounded-full font-semibold">Internal note</span>
                            ) : message.is_staff_reply ? (
                              <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-200 rounded-full font-semibold">Staff reply</span>
                            ) : (
                              <span className="px-2 py-0.5 bg-slate-700 text-slate-200 rounded-full font-semibold">Customer</span>
                            )}
                            <span className="font-medium text-slate-200">{message.author_name}</span>
                          </div>
                          <span>{new Date(message.created_at).toLocaleString()}</span>
                        </div>
                        <p className="text-slate-300 whitespace-pre-line">{message.message}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-400 text-center py-6">No messages yet</p>
                  )}
                </div>
              </div>

              {selectedTicket.status !== 'closed' && (
                <div className="mt-6 space-y-3">
                  <label className="flex items-center gap-2 text-sm text-slate-300">
                    <input
                      type="checkbox"
                      checked={isInternalNote}
                      onChange={(e) => setIsInternalNote(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-900 text-cyan-600 focus:ring-cyan-500"
                    />
                    Internal note (private)
                  </label>
                  <textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    rows={3}
                    placeholder={isInternalNote ? 'Add an internal note...' : 'Write a reply to the customer...'}
                    className="w-full border border-slate-800 bg-slate-900 text-white rounded-2xl p-4 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 placeholder-slate-500"
                  />
                  <button
                    onClick={handleSendReply}
                    disabled={!replyMessage.trim()}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold shadow hover:from-cyan-400 hover:to-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="h-5 w-5" />
                    Send
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500">
              <MessageSquare className="h-10 w-10 text-slate-400 mb-2" />
              <p className="font-semibold text-slate-600">Select a ticket</p>
              <p className="text-sm">Choose a ticket from the list to review details and respond.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
