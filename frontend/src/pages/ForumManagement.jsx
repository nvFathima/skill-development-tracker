import React, { useState, useEffect } from 'react';
import { Search, Flag, Edit2, Trash2, MessageSquare } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import axiosInstance from '../utils/axios';
import { toast } from 'sonner';

const ForumManagement = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPost, setSelectedPost] = useState(null);
  const [showFlagged, setShowFlagged] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editContent, setEditContent] = useState({ title: '', content: '' });
  const [selectedComment, setSelectedComment] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, [showFlagged]);

  const fetchPosts = async () => {
    try {
      const response = await axiosInstance.get(`/admin/posts${showFlagged ? '?flaggedOnly=true' : ''}`);
      setPosts(response.data.posts || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    try {
      if (selectedComment) {
        await axiosInstance.put(`/admin/posts/${selectedPost._id}/comments/${selectedComment._id}`, {
          content: editContent.content
        });
      } else {
        await axiosInstance.put(`/admin/posts/${selectedPost._id}`, editContent);
      }
      fetchPosts();
      setEditMode(false);
      setSelectedComment(null);
      toast.success('Content Updated Successfully');
    } catch (error) {
      console.error('Error updating content:', error);
    }
  };

  const handleDelete = async (postId, commentId = null) => {
    const message = commentId 
      ? 'Are you sure you want to delete this comment?' 
      : 'Are you sure you want to delete this post?';
    
    if (window.confirm(message)) {
      try {
        const endpoint = commentId
          ? `/admin/posts/${postId}/comments/${commentId}`
          : `/admin/posts/${postId}`;
        
        await axiosInstance.delete(endpoint);
        fetchPosts();
        if (selectedPost?._id === postId) {
          setSelectedPost(null);
        }
        toast.success('Post deleted successfully!')
      } catch (error) {
        console.error('Error deleting:', error);
      }
    }
  };

  const handleResolveFlagged = async (postId, commentId, flagId, action) => {
    try {
      await axiosInstance.post('/admin/resolve-flagged', {
        postId,
        commentId,
        flagId,
        action,
        notifyUser: commentId 
          ? selectedPost.comments.find(c => c._id === commentId).userId._id 
          : selectedPost.author._id,
      });
      fetchPosts();
      toast.success('Flag resovled successfully!');
    } catch (error) {
      console.error('Error resolving flag:', error);
    }
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.author.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Forum Management</CardTitle>
          <div className="flex gap-4 items-center mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search posts..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button
              variant={showFlagged ? "destructive" : "outline"}
              onClick={() => setShowFlagged(!showFlagged)}
            >
              <Flag className="mr-2 h-4 w-4" />
              {showFlagged ? 'Show All' : 'Show Flagged'}
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead className="text-center">Likes</TableHead>
                  <TableHead className="text-center">Comments</TableHead>
                  <TableHead className="text-center">Flags</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPosts.map(post => (
                  <TableRow key={post._id}>
                    <TableCell>
                      <button
                        className="text-left hover:text-blue-600"
                        onClick={() => {
                          setSelectedPost(post);
                          setEditContent({ title: post.title, content: post.content });
                        }}
                      >
                        {post.title}
                      </button>
                    </TableCell>
                    <TableCell>{post.author.fullName}</TableCell>
                    <TableCell className="text-center">{post.likes?.length || 0}</TableCell>
                    <TableCell className="text-center">{post.comments?.length || 0}</TableCell>
                    <TableCell className="text-center">
                      {post.flags?.length > 0 && (
                        <Badge variant="destructive">
                          {post.flags.length}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(post._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {selectedPost && (
          <Dialog 
            open={!!selectedPost} 
            onOpenChange={() => {
              setSelectedPost(null);
              setEditMode(false);
              setSelectedComment(null);
            }}
          >
            <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
              <DialogHeader>
                <DialogTitle>
                  {editMode ? 'Edit Content' : 'View Post'}
                </DialogTitle>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto pr-2">
                {editMode ? (
                  <div className="space-y-4">
                    {!selectedComment && (
                      <Input
                        value={editContent.title}
                        onChange={(e) => setEditContent(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Post title"
                      />
                    )}
                    <textarea
                      className="w-full min-h-[200px] p-2 border rounded-md"
                      value={editContent.content}
                      onChange={(e) => setEditContent(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Content"
                    />
                    <div className="flex justify-end gap-2 sticky bottom-0 bg-white py-2">
                      <Button variant="outline" onClick={() => {
                        setEditMode(false);
                        setSelectedComment(null);
                      }}>Cancel</Button>
                      <Button onClick={handleEdit}>Save Changes</Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold">{selectedPost.title}</h3>
                      <p className="text-sm text-gray-500">
                        by {selectedPost.author.fullName} • {new Date(selectedPost.createdAt).toLocaleDateString()}
                      </p>
                      <p className="mt-4 whitespace-pre-wrap">{selectedPost.content}</p>
                      <div className="mt-2 flex gap-4 text-sm text-gray-500">
                        <span>{selectedPost.likes?.length || 0} likes</span>
                        <span>{selectedPost.comments?.length || 0} comments</span>
                      </div>
                    </div>

                    {selectedPost.flags?.length > 0 && (
                      <Alert>
                        <AlertDescription>
                          <h4 className="font-semibold mb-2">Post Flags</h4>
                          {selectedPost.flags.map(flag => (
                            <div key={flag._id} className="flex justify-between items-center mb-2">
                              <div>
                                <p className="text-sm">
                                  Reported by: {flag.userId.fullName}
                                  <br />
                                  Reason: {flag.reason}
                                </p>
                              </div>
                              {flag.status === 'pending' && (
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleResolveFlagged(selectedPost._id, null, flag._id, 'reviewed')}
                                  >
                                    Accept
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleResolveFlagged(selectedPost._id, null, flag._id, 'dismissed')}
                                  >
                                    Dismiss
                                  </Button>
                                </div>
                              )}
                            </div>
                          ))}
                        </AlertDescription>
                      </Alert>
                    )}

                    <div>
                      <h4 className="font-semibold mb-4">Comments</h4>
                      <div className="space-y-4">
                        {selectedPost.comments?.map(comment => (
                          <div key={comment._id} className="border rounded p-3">
                            <div className="flex justify-between">
                              <p className="text-sm">
                                <span className="font-medium">{comment.userId.fullName}</span>
                                <span className="text-gray-500 ml-2">
                                  {new Date(comment.createdAt).toLocaleDateString()}
                                </span>
                              </p>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedComment(comment);
                                    setEditContent({ content: comment.content });
                                    setEditMode(true);
                                  }}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(selectedPost._id, comment._id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            <p className="mt-2">{comment.content}</p>
                            
                            {comment.flags?.length > 0 && (
                              <Alert className="mt-2">
                                <AlertDescription>
                                  {comment.flags.map(flag => (
                                    <div key={flag._id} className="flex justify-between items-center">
                                      <div>
                                        <p className="text-sm">
                                          Reported by: {flag.userId.fullName}
                                          <br />
                                          Reason: {flag.reason}
                                        </p>
                                      </div>
                                      {flag.status === 'pending' && (
                                        <div className="flex gap-2">
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleResolveFlagged(selectedPost._id, comment._id, flag._id, 'reviewed')}
                                          >
                                            Accept
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleResolveFlagged(selectedPost._id, comment._id, flag._id, 'dismissed')}
                                          >
                                            Dismiss
                                          </Button>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </AlertDescription>
                              </Alert>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end sticky bottom-0 bg-white py-2">
                      <Button variant="outline" onClick={() => setEditMode(true)}>
                        <Edit2 className="mr-2 h-4 w-4" />
                        Edit Post
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        
        )}
      </CardContent>
      </Card>
    </div>
  );
};

export default ForumManagement;