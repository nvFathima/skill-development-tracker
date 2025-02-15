import React, { useState, useEffect, useRef } from 'react';
import axiosInstance from '../utils/axios';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { 
  Plus, Trash2,  Award, Target, Upload, User, Briefcase, GraduationCap, 
  Mail, Phone, Building, MapPin, Pencil, MoreVertical } from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,DropdownMenuTrigger, } from "@/components/ui/DropdownMenu";

const Profile = () => {
  const [photoPreview, setPhotoPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ skillsCount: 0, goalsCount: 0 });
  const [profile, setProfile] = useState({
    fullName: '',
    age: '',
    email: '',
    phone: '',
    alternateEmail: '',
    profilePhoto: '',
    employmentDetails: {
      status: 'unemployed',
      currentJob: { company: '', title: '', startDate: '' },
      preferredJobs: [],
    },
    education: [],
  });
  const [newPreferredJob, setNewPreferredJob] = useState("");

  useEffect(() => {
    fetchProfile();
    fetchStats();
  }, []);

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
  
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
  
    // Validate file size (e.g., 5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size should be less than 5MB');
      return;
    }
  
    try {
      setUploading(true);
  
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
  
      // Create FormData
      const formData = new FormData();
      formData.append('photo', file);
  
      // Upload photo
      const response = await axiosInstance.post('/profile/photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      // Update profile with new photo URL
      setProfile((prev) => ({
        ...prev,
        profilePhoto: response.data.photoUrl,
      }));
  
      toast.success('Profile photo updated successfully!');
  
      // Refresh the page to reflect changes
      window.location.reload();
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Failed to upload profile photo');
      setPhotoPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = async () => {
    try {
      await axiosInstance.delete('/profile/photo');
      setProfile((prev) => ({
        ...prev,
        profilePhoto: '',
      }));
      setPhotoPreview(null);
      toast.success('Profile photo removed');
  
      // Refresh the page to reflect changes
      window.location.reload();
    } catch (error) {
      console.error('Error removing photo:', error);
      toast.error('Failed to remove profile photo');
    }
  };

  const fetchProfile = async () => {
    try {
      const response = await axiosInstance.get('/profile');
      setProfile(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axiosInstance.get('/profile/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to load profile stats.');
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.put('/profile', profile);
      setProfile(response.data);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile.');
    }
  };

  const renderProfileHeader = () => (
    <div className="relative mb-8">
      {/* Profile Background */}
      <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-500" />
      
      {/* Profile Info Overlay */}
      <div className="absolute -bottom-16 left-0 w-full px-6 flex items-end">
        <div className="relative group">
          <div className="w-32 h-32 rounded-full border-4 border-white bg-white overflow-hidden shadow-lg">
            {(photoPreview || profile.profilePhoto) ? (
              <img
                src={`${"http://localhost:8800"}${photoPreview || profile.profilePhoto}`}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <User className="w-12 h-12 text-gray-400" />
              </div>
            )}
            {uploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
              </div>
            )}
          </div>

          {/* Floating Action Button with Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                className="absolute bottom-0 right-0 rounded-full w-8 h-8 p-0 bg-blue-600 hover:bg-blue-700 text-white shadow-lg 
                           flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              >
                <Pencil className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-gray-800">
              <DropdownMenuItem onClick={handlePhotoClick} className="cursor-pointer dark:text-gray-300">
                <Upload className="w-4 h-4 mr-2" />
                {profile.profilePhoto ? 'Change Photo' : 'Upload Photo'}
              </DropdownMenuItem>
              {(photoPreview || profile.profilePhoto) && (
                <DropdownMenuItem 
                  onClick={removePhoto} 
                  className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove Photo
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <input
            ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange}
          />
        </div>
        
        <div className="ml-6 mb-3">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-200">{profile.fullName || 'Your Name'}</h1>
          <p className="text-gray-600 flex items-center gap-2">
            <Mail className="w-4 h-4" />
            {profile.email}
          </p>
        </div>
      </div>
    </div>
  );

  const renderStatsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 mt-20">
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-lg transition-shadow duration-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Award className="w-6 h-6 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Skills</p>
              <p className="text-xl font-bold text-blue-600">{stats.skillsCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-green-50 to-green-100 hover:shadow-lg transition-shadow duration-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Target className="w-6 h-6 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Goals</p>
              <p className="text-xl font-bold text-green-600">{stats.goalsCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-lg transition-shadow duration-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Briefcase className="w-6 h-6 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600">Experience</p>
              <p className="text-xl font-bold text-purple-600">
                {profile.employmentDetails.status === 'employed' ? 'Active' : 'Seeking'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-orange-50 to-orange-100 hover:shadow-lg transition-shadow duration-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <GraduationCap className="w-6 h-6 text-orange-600" />
            <div>
              <p className="text-sm text-gray-600">Education</p>
              <p className="text-xl font-bold text-orange-600">{profile.education?.length || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPersonalInfo = () => (
    <Card className="mb-6 dark:bg-gray-800">
      <CardHeader className="flex flex-row items-center gap-2 dark:text-gray-300">
        <User className="w-5 h-5" />
        <span className="font-bold text-lg">Personal Information</span>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-400">Full Name</label>
          <Input
            placeholder="Enter your full name" value={profile.fullName}
            onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
            className="hover:border-blue-400 focus:border-blue-500"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-400">Age</label>
          <Input
            type="number" placeholder="Enter your age" value={profile.age}
            onChange={(e) => setProfile({ ...profile, age: e.target.value })}
            className="hover:border-blue-400 focus:border-blue-500"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-400">Phone Number</label>
          <Input
            placeholder="Enter your phone number" value={profile.phone}
            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            className="hover:border-blue-400 focus:border-blue-500"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-400">Alternate Email</label>
          <Input
            placeholder="Enter alternate email (optional)" value={profile.alternateEmail}
            onChange={(e) => setProfile({ ...profile, alternateEmail: e.target.value })}
            className="hover:border-blue-400 focus:border-blue-500"
          />
        </div>
      </CardContent>
    </Card>
  );

  const renderEmploymentDetails = () => (
    <Card className="mb-6 dark:bg-gray-800">
      <CardHeader className="flex flex-row items-center gap-2 dark:text-gray-300">
        <Briefcase className="w-5 h-5" />
        <span className="font-bold text-lg">Employment Details</span>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-400">Employment Status</label>
          <Select
            value={profile.employmentDetails.status}
            onValueChange={(value) =>
              setProfile((prev) => ({
                ...prev,
                employmentDetails: { ...prev.employmentDetails, status: value },
              }))
            }
          >
            <SelectTrigger className="hover:border-blue-400 focus:border-blue-500">
              <SelectValue placeholder="Select Employment Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="employed">Employed</SelectItem>
              <SelectItem value="unemployed">Unemployed</SelectItem>
              <SelectItem value="student">Student</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {profile.employmentDetails.status === "employed" && (
          <div className="p-4 bg-gray-50 rounded-lg space-y-4 dark:bg-gray-900">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2 dark:text-gray-400">
                  <Building className="w-4 h-4" />
                  Company
                </label>
                <Input
                  placeholder="Enter company name"
                  value={profile.employmentDetails.currentJob?.company || ""}
                  onChange={(e) =>
                    setProfile((prev) => ({
                      ...prev,
                      employmentDetails: {
                        ...prev.employmentDetails,
                        currentJob: {
                          ...prev.employmentDetails.currentJob,
                          company: e.target.value,
                        },
                      },
                    }))
                  }
                  className="hover:border-blue-400 focus:border-blue-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2 dark:text-gray-400">
                  <MapPin className="w-4 h-4" />
                  Job Title
                </label>
                <Input
                  placeholder="Enter job title" value={profile.employmentDetails.currentJob?.title || ""}
                  onChange={(e) =>
                    setProfile((prev) => ({
                      ...prev,
                      employmentDetails: {
                        ...prev.employmentDetails,
                        currentJob: {
                          ...prev.employmentDetails.currentJob,
                          title: e.target.value,
                        },
                      },
                    }))
                  }
                  className="hover:border-blue-400 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {profile.employmentDetails.status === "unemployed" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Preferred Jobs</label>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Enter preferred job title" value={newPreferredJob}
                  onChange={(e) => setNewPreferredJob(e.target.value)}
                  className="hover:border-blue-400 focus:border-blue-500"
                />
                <Button
                  type="button"
                  onClick={() => {
                    if (newPreferredJob.trim()) {
                      setProfile((prev) => ({
                        ...prev,
                        employmentDetails: {
                          ...prev.employmentDetails,
                          preferredJobs: [
                            ...prev.employmentDetails.preferredJobs,
                            newPreferredJob.trim(),
                          ],
                        },
                      }));
                      setNewPreferredJob("");
                    }
                  }}
                  className="shrink-0"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              {profile.employmentDetails.preferredJobs?.map((job, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  <span className="text-gray-700">{job}</span>
                  <Button
                    variant="ghost" size="sm"
                    onClick={() =>
                      setProfile((prev) => ({
                        ...prev,
                        employmentDetails: {
                          ...prev.employmentDetails,
                          preferredJobs: prev.employmentDetails.preferredJobs.filter(
                            (_, i) => i !== index
                          ),
                        },
                      }))
                    }
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderEducation = () => (
    <Card className="mb-6 dark:bg-gray-800">
      <CardHeader className="flex flex-row items-center gap-2 dark:text-gray-300">
        <GraduationCap className="w-5 h-5" />
        <span className="font-bold text-lg">Education</span>
      </CardHeader>
      <CardContent className="space-y-4">
        {profile.education?.map((edu, index) => (
          <div 
            key={index} 
            className="border border-gray-200 p-4 rounded-lg space-y-4 hover:border-blue-200 transition-colors duration-200"
          >
            <div className="flex justify-between items-center">
              <h4 className="font-semibold text-gray-700 dark:text-gray-300">Education Entry {index + 1}</h4>
              <Button
                variant="ghost" size="sm"
                onClick={() => {
                  const updatedEducation = profile.education.filter(
                    (_, eduIndex) => eduIndex !== index
                  );
                  setProfile((prev) => ({
                    ...prev,
                    education: updatedEducation,
                  }));
                }}
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-400">Degree</label>
                <Input
                  placeholder="Enter your degree" value={edu.degree || ""}
                  onChange={(e) => {
                    const updatedEducation = [...profile.education];
                    updatedEducation[index].degree = e.target.value;
                    setProfile((prev) => ({
                      ...prev, education: updatedEducation,
                    }));
                  }}
                  className="hover:border-blue-400 focus:border-blue-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-400">Field of Study</label>
                <Input
                  placeholder="Enter your field of study"
                  value={edu.field || ""}
                  onChange={(e) => {
                    const updatedEducation = [...profile.education];
                    updatedEducation[index].field = e.target.value;
                    setProfile((prev) => ({
                      ...prev,
                      education: updatedEducation,
                    }));
                  }}
                  className="hover:border-blue-400 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            setProfile((prev) => ({
              ...prev,
              education: [
                ...prev.education,
                {
                  degree: "",
                  field: "",
                },
              ],
            }));
          }}
          className="w-full hover:bg-blue-50 border-dashed dark:text-gray-400"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Education
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-transparent">
      {loading ? (
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto pb-12">
          <form onSubmit={handleProfileSubmit}>
            {renderProfileHeader()}
            {renderStatsCards()}
            <div className="px-4">
              {renderPersonalInfo()}
              {renderEmploymentDetails()}
              {renderEducation()}
              
              <Button 
                type="submit" 
                className="w-full bg-blue-600 text-white hover:bg-blue-700 h-12 text-lg font-medium rounded-lg"
              >
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Profile;