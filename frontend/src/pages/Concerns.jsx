import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Search, AlertCircle, Clock, CheckCircle2, HelpCircle, Trash2 } from 'lucide-react';
import axiosInstance from '../utils/axios';

const ConcernSharing = () => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [concerns, setConcerns] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [concernToDelete, setConcernToDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserConcerns();
  }, []);

  const fetchUserConcerns = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await axiosInstance.get('/concerns/my-concerns', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConcerns(response.data);
    } catch (err) {
      console.error('Error fetching concerns:', err);
      setError('Failed to fetch your concerns');
    }
  };

  const handleSubmitConcern = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!subject.trim() || !message.trim()) {
      setError('Please fill in both subject and message fields');
      return;
    }

    try {
      setIsSubmitting(true);
      const token = sessionStorage.getItem('token');
      await axiosInstance.post('/concerns', 
        { subject, message }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSuccess('Your concern has been successfully submitted');
      setSubject('');
      setMessage('');
      fetchUserConcerns();
    } catch (err) {
      console.error('Error submitting concern:', err);
      setError('Failed to submit concern. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Resolved':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'In Review':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <HelpCircle className="w-4 h-4 text-blue-600" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredConcerns = concerns.filter(concern =>
    concern.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    concern.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (concernId) => {
    try {
      setIsDeleting(true);
      setDeleteError('');
      
      const token = sessionStorage.getItem('token');
      await axiosInstance.delete(`/concerns/${concernId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Remove the concern from the local state
      setConcerns(concerns.filter(concern => concern._id !== concernId));
      setShowDeleteDialog(false);
      setConcernToDelete(null);
      
      // Show success message
      setSuccess('Concern deleted successfully');
    } catch (err) {
      console.error('Error deleting concern:', err);
      setDeleteError('Failed to delete concern. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const openDeleteDialog = (concern) => {
    setConcernToDelete(concern);
    setShowDeleteDialog(true);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Concern Submission Form */}
        <Card className="md:sticky md:top-6 h-min">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Share Your Concern
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitConcern} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Subject</label>
                <Input 
                  placeholder="Brief description of your concern"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Message</label>
                <Textarea 
                  placeholder="Provide detailed information about your concern..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={5}
                  className="w-full"
                />
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {success && (
                <Alert className="bg-green-50 text-green-800 border-green-200">
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Concern'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Concerns History with Fixed Height and Scroll */}
        <Card className="h-[calc(100vh-6rem)]">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center justify-between">
              <span>Your Concerns</span>
              <div className="relative w-64">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search concerns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[calc(100vh-14rem)] overflow-y-auto">
              {concerns.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <HelpCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>No concerns submitted yet</p>
                  <p className="text-sm">Your submitted concerns will appear here</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-white z-10">
                      <TableRow>
                        <TableHead>Subject</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredConcerns.map((concern) => (
                        <TableRow key={concern._id}>
                          <TableCell className="font-medium">{concern.subject}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(concern.status)}
                              <span className={`
                                px-2 py-1 rounded-full text-xs font-medium
                                ${concern.status === 'Resolved' ? 'bg-green-100 text-green-800' : 
                                  concern.status === 'In Review' ? 'bg-yellow-100 text-yellow-800' : 
                                  'bg-blue-100 text-blue-800'}
                              `}>
                                {concern.status}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>{formatDate(concern.createdAt)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    View Details
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md">
                                              <DialogHeader>
                                                <DialogTitle>Concern Details</DialogTitle>
                                              </DialogHeader>
                                              <div className="space-y-4">
                                                <div className="grid gap-1">
                                                  <label className="text-sm font-medium text-gray-500">Subject</label>
                                                  <p>{concern.subject}</p>
                                                </div>
                                                <div className="grid gap-1">
                                                  <label className="text-sm font-medium text-gray-500">Message</label>
                                                  <p className="text-sm">{concern.message}</p>
                                                </div>
                                                <div className="grid gap-1">
                                                  <label className="text-sm font-medium text-gray-500">Status</label>
                                                  <div className="flex items-center gap-2">
                                                    {getStatusIcon(concern.status)}
                                                    <span className={`
                                                      px-2 py-1 rounded-full text-xs font-medium
                                                      ${concern.status === 'Resolved' ? 'bg-green-100 text-green-800' : 
                                                        concern.status === 'In Review' ? 'bg-yellow-100 text-yellow-800' : 
                                                        'bg-blue-100 text-blue-800'}
                                                    `}>
                                                      {concern.status}
                                                    </span>
                                                  </div>
                                                </div>
                                                <div className="grid gap-1">
                                                  <label className="text-sm font-medium text-gray-500">Submitted on</label>
                                                  <p>{formatDate(concern.createdAt)}</p>
                                                </div>
                                              </div>
                                              </DialogContent>
                              </Dialog>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => openDeleteDialog(concern)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {/* Delete Confirmation Dialog */}
                  <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Delete Concern</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <p>Are you sure you want to delete this concern?</p>
                        <p className="text-sm text-gray-500">
                          Subject: {concernToDelete?.subject}
                        </p>
                        {deleteError && (
                          <Alert variant="destructive">
                            <AlertDescription>{deleteError}</AlertDescription>
                          </Alert>
                        )}
                      </div>
                      <DialogFooter className="flex space-x-2 mt-4">
                        <Button
                          variant="outline"
                          onClick={() => setShowDeleteDialog(false)}
                          disabled={isDeleting}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleDelete(concernToDelete?._id)}
                          disabled={isDeleting}
                        >
                          {isDeleting ? 'Deleting...' : 'Delete'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ConcernSharing;