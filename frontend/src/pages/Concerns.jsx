import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import axiosInstance from '../utils/axios';

const ConcernSharing = () => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [concerns, setConcerns] = useState([]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserConcerns();
  }, []);

  const fetchUserConcerns = async () => {
    try {
      const token = localStorage.getItem('token');
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
    
    if (!subject.trim() || !message.trim()) {
      setError('Subject and message are required');
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token');
      await axiosInstance.post('/concerns', 
        { subject, message }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Reset form and refresh concerns
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Concern Submission Form */}
      <Card>
        <CardHeader>
          <CardTitle>Share Your Concern</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitConcern}>
            <div className="space-y-4">
              <Input 
                placeholder="Subject" 
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
              <Textarea 
                placeholder="Describe your concern in detail" 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={5}
              />
              {error && (
                <div className="text-red-500 text-sm">
                  {error}
                </div>
              )}
            </div>
            <CardFooter className="pt-4 px-0">
              <Button 
                type="submit" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Concern'}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>

      {/* Concerns History */}
      <Card>
        <CardHeader>
          <CardTitle>Your Concerns</CardTitle>
        </CardHeader>
        <CardContent>
          {concerns.length === 0 ? (
            <p className="text-gray-500">No concerns submitted yet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {concerns.map((concern) => (
                  <TableRow key={concern._id}>
                    <TableCell>{concern.subject}</TableCell>
                    <TableCell>
                      <span className={`
                        px-2 py-1 rounded text-xs
                        ${concern.status === 'Resolved' ? 'bg-green-100 text-green-800' : 
                          concern.status === 'In Review' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-blue-100 text-blue-800'}
                      `}>
                        {concern.status}
                      </span>
                    </TableCell>
                    <TableCell>{formatDate(concern.createdAt)}</TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Concern Details</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <strong>Subject:</strong> {concern.subject}
                            </div>
                            <div>
                              <strong>Message:</strong> {concern.message}
                            </div>
                            <div>
                              <strong>Status:</strong> {concern.status}
                            </div>
                            <div>
                              <strong>Submitted on:</strong> {formatDate(concern.createdAt)}
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ConcernSharing;