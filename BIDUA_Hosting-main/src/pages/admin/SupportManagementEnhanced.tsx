import { useState, useEffect } from 'react';
import {
  MessageSquare,
  Search,
  Clock,
  CheckCircle,
  AlertCircle,
  User as UserIcon,
  Send,
  ArrowLeft,
  UserPlus,
  Settings
} from 'lucide-react';

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
  const [view, setView] = useState<'list' | 'detail'>('list');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<TicketDetail | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [assignedFilter, setAssignedFilter] = useState<number | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);

  useEffect(() => {
    loadTickets();
    loadEmployees();
  }, [statusFilter, priorityFilter, assignedFilter]);

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
      setLoading(true);
      const response = await fetch(`http://localhost:8000/api/v1/support/tickets/${ticketId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
      });
      const data = await response.json();
      setSelectedTicket(data);
      setView('detail');
    } catch (error) {
      console.error('Failed to load ticket:', error);
    } finally {
      setLoading(false);
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
      if (selectedTicket) {
        await loadTicketDetail(ticketId);
      }
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
      if (selectedTicket) {
        await loadTicketDetail(ticketId);
      }
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
      case 'open': return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
      case 'in_progress': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'closed': return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
      case 'high': return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'low': return 'text-green-400 bg-green-500/10 border-green-500/30';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Support Management</h1>
        <p className="text-slate-400">Manage and respond to customer support tickets</p>
      </div>

      {/* Detail View */}
      {view === 'detail' && selectedTicket && (
        <div className="bg-slate-900/60 backdrop-blur-xl rounded-xl border border-cyan-500/30 overflow-hidden">
          <div className="p-6 border-b border-cyan-500/30">
            <button
              onClick={() => setView('list')}
              className="flex items-center space-x-2 text-cyan-400 hover:text-cyan-300 mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Tickets</span>
            </button>
            
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">{selectedTicket.subject}</h2>
                  <p className="text-sm font-mono text-slate-400">#{selectedTicket.ticket_number}</p>
                  <p className="text-sm text-slate-400 mt-2">Customer: {selectedTicket.user_name} ({selectedTicket.user_email})</p>
                  <p className="text-sm text-slate-400">Created: {new Date(selectedTicket.created_at).toLocaleString()}</p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(selectedTicket.status)}`}>
                    {getStatusIcon(selectedTicket.status)}
                    <span className="capitalize">{selectedTicket.status.replace('_', ' ')}</span>
                  </span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(selectedTicket.priority)}`}>
                    <span className="capitalize">{selectedTicket.priority}</span>
                  </span>
                </div>
              </div>

              {/* Assignment and Status Controls */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-2">Assign To</label>
                  <select
                    value={selectedTicket.assigned_to || ''}
                    onChange={(e) => e.target.value && handleAssignTicket(selectedTicket.id, Number(e.target.value))}
                    className="w-full px-4 py-2 bg-slate-950 border border-cyan-500/30 rounded-lg text-white text-sm"
                  >
                    <option value="">Unassigned</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>{emp.full_name} ({emp.active_tickets} active)</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-2">Status</label>
                  <select
                    value={selectedTicket.status}
                    onChange={(e) => handleUpdateStatus(selectedTicket.id, e.target.value)}
                    className="w-full px-4 py-2 bg-slate-950 border border-cyan-500/30 rounded-lg text-white text-sm"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-2">Department</label>
                  <p className="px-4 py-2 bg-slate-950 border border-cyan-500/30 rounded-lg text-white text-sm capitalize">
                    {selectedTicket.department}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Initial Description */}
          <div className="p-6 border-b border-cyan-500/20 bg-slate-950">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full flex items-center justify-center flex-shrink-0">
                <UserIcon className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="font-semibold text-white">{selectedTicket.user_name}</span>
                  <span className="text-sm text-slate-400">{new Date(selectedTicket.created_at).toLocaleString()}</span>
                </div>
                <p className="text-slate-300 whitespace-pre-wrap">{selectedTicket.description}</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
            {selectedTicket.messages && selectedTicket.messages.length > 0 ? (
              selectedTicket.messages.map((msg) => (
                <div key={msg.id} className={`flex items-start space-x-3 ${msg.is_staff_reply ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.is_staff_reply ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gradient-to-r from-cyan-500 to-teal-500'
                  }`}>
                    <UserIcon className="h-5 w-5 text-white" />
                  </div>
                  <div className={`flex-1 ${msg.is_staff_reply ? 'text-right' : ''}`}>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-semibold text-white">{msg.author_name}</span>
                      {msg.is_staff_reply && <span className="text-xs text-purple-400 font-semibold">STAFF</span>}
                      {msg.is_internal_note && <span className="text-xs text-orange-400 font-semibold">INTERNAL NOTE</span>}
                      <span className="text-sm text-slate-400">{new Date(msg.created_at).toLocaleString()}</span>
                    </div>
                    <div className={`p-4 rounded-lg ${
                      msg.is_internal_note ? 'bg-orange-500/10 border border-orange-500/30' :
                      msg.is_staff_reply ? 'bg-purple-500/10 border border-purple-500/30' : 'bg-slate-950'
                    }`}>
                      <p className="text-slate-300 whitespace-pre-wrap">{msg.message}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-slate-400 py-8">No replies yet</p>
            )}
          </div>

          {/* Reply Box */}
          {selectedTicket.status !== 'closed' && (
            <div className="p-6 border-t border-cyan-500/30 space-y-3">
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isInternalNote}
                    onChange={(e) => setIsInternalNote(e.target.checked)}
                    className="w-4 h-4 text-cyan-500 bg-slate-950 border-cyan-500/30 rounded focus:ring-cyan-500"
                  />
                  <span className="text-sm text-slate-300">Internal Note (not visible to customer)</span>
                </label>
              </div>
              
              <div className="flex items-end space-x-3">
                <div className="flex-1">
                  <textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder={isInternalNote ? "Add internal note..." : "Type your reply to customer..."}
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-950 border border-cyan-500/30 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-slate-400 resize-none"
                  />
                </div>
                <button
                  onClick={handleSendReply}
                  disabled={!replyMessage.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-lg font-semibold hover:from-cyan-400 hover:to-teal-400 transition shadow-lg shadow-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <Send className="h-5 w-5" />
                  <span>Send</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* List View */}
      {view === 'list' && (
        <div className="bg-slate-900/60 backdrop-blur-xl rounded-xl border border-cyan-500/30 overflow-hidden">
          <div className="p-6 border-b border-cyan-500/30 space-y-4">
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-950 border border-cyan-500/30 rounded-lg text-white text-sm"
                >
                  <option value="all">All Statuses</option>
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">Priority</label>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-950 border border-cyan-500/30 rounded-lg text-white text-sm"
                >
                  <option value="all">All Priorities</option>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">Assigned To</label>
                <select
                  value={assignedFilter || ''}
                  onChange={(e) => setAssignedFilter(e.target.value ? Number(e.target.value) : null)}
                  className="w-full px-4 py-2 bg-slate-950 border border-cyan-500/30 rounded-lg text-white text-sm"
                >
                  <option value="">All Employees</option>
                  <option value="0">Unassigned</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>{emp.full_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-cyan-500/30 rounded-lg text-white text-sm placeholder-slate-400"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
                <p className="text-slate-400 mt-4">Loading tickets...</p>
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">No tickets found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    onClick={() => loadTicketDetail(ticket.id)}
                    className="p-4 bg-slate-950 rounded-lg border border-cyan-500/30 hover:border-cyan-500/50 transition cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-sm font-mono text-slate-400">{ticket.ticket_number}</span>
                          <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(ticket.status)}`}>
                            {getStatusIcon(ticket.status)}
                            <span className="capitalize">{ticket.status.replace('_', ' ')}</span>
                          </span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${getPriorityColor(ticket.priority)}`}>
                            <span className="capitalize">{ticket.priority}</span>
                          </span>
                          {ticket.assigned_to_name && (
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-semibold text-purple-400 bg-purple-500/10 border border-purple-500/30">
                              <UserPlus className="h-3 w-3" />
                              <span>{ticket.assigned_to_name}</span>
                            </span>
                          )}
                        </div>
                        <h3 className="text-white font-semibold mb-1">{ticket.subject}</h3>
                        <p className="text-sm text-slate-400">Customer: {ticket.user_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-slate-400">
                      <div className="flex items-center space-x-4">
                        <span>Created: {new Date(ticket.created_at).toLocaleDateString()}</span>
                        <span>Updated: {new Date(ticket.updated_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageSquare className="h-4 w-4" />
                        <span>{ticket.message_count}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
