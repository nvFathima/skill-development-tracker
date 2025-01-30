import React, { useState, useEffect, useRef } from 'react';
import axiosInstance from '../utils/axios';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Trash2, Award, Target, Upload, X } from 'lucide-react';

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
      setProfile(prev => ({
        ...prev,
        profilePhoto: response.data.photoUrl
      }));

      toast.success('Profile photo updated successfully!');
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
      setProfile(prev => ({
        ...prev,
        profilePhoto: ''
      }));
      setPhotoPreview(null);
      toast.success('Profile photo removed');
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

  const photoUploadSection = (
    <Card className="overflow-hidden">
      <CardHeader className="font-bold text-lg">Profile Photo</CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center space-y-4">
          <div 
            className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-gray-200 cursor-pointer"
            onClick={handlePhotoClick}
          >
            {(photoPreview || profile.profilePhoto) ? (
              <img
              src={`${"http://localhost:8800"}${photoPreview || profile.profilePhoto}`}
              alt="Profile"
              className="w-full h-full object-cover"
            />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <Upload className="w-8 h-8 text-gray-400" />
              </div>
            )}
            {uploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            )}
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoChange}
          />
          
          <div className="flex space-x-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePhotoClick}
            >
              {profile.profilePhoto ? 'Change Photo' : 'Upload Photo'}
            </Button>
            
            {(photoPreview || profile.profilePhoto) && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={removePhoto}
              >
                <X className="w-4 h-4 mr-2" />
                Remove
              </Button>
            )}
          </div>
          
          <p className="text-sm text-gray-500">
            Supported formats: JPG, PNG, GIF (max. 5MB)
          </p>
        </div>
      </CardContent>
    </Card>
  );

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

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800">Profile Management</h1>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Award className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total Skills</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.skillsCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-50 to-green-100 hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Target className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total Goals</p>
                    <p className="text-2xl font-bold text-green-600">{stats.goalsCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-6">
          {photoUploadSection}
            <Card>
              <CardHeader className="font-bold text-lg">Personal Information</CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Full Name</label>
                  <Input
                    placeholder="Enter your full name"
                    value={profile.fullName}
                    onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Age</label>
                  <Input
                    type="number"
                    placeholder="Enter your age"
                    value={profile.age}
                    onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <Input value={profile.email} disabled />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Phone Number</label>
                  <Input
                    placeholder="Enter your phone number"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Alternate Email</label>
                  <Input
                    placeholder="Enter alternate email (optional)"
                    value={profile.alternateEmail}
                    onChange={(e) => setProfile({ ...profile, alternateEmail: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="font-bold text-lg">Employment Details</CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Employment Status</label>
                  <Select
                    value={profile.employmentDetails.status}
                    onValueChange={(value) =>
                      setProfile((prev) => ({
                        ...prev,
                        employmentDetails: { ...prev.employmentDetails, status: value },
                      }))
                    }
                  >
                    <SelectTrigger>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Company</label>
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
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Job Title</label>
                      <Input
                        placeholder="Enter job title"
                        value={profile.employmentDetails.currentJob?.title || ""}
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
                      />
                    </div>
                  </div>
                )}

                {profile.employmentDetails.status === "unemployed" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Add Preferred Jobs</label>
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="Enter preferred job title"
                          value={newPreferredJob}
                          onChange={(e) => setNewPreferredJob(e.target.value)}
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
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Preferred Jobs List</label>
                      <div className="space-y-2">
                        {profile.employmentDetails.preferredJobs?.map((job, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <span className="text-gray-700">{job}</span>
                            <Button
                              variant="ghost"
                              size="sm"
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
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="font-bold text-lg">Education</CardHeader>
              <CardContent className="space-y-4">
                {profile.education?.map((edu, index) => (
                  <div key={index} className="border p-4 rounded-md space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-semibold">Education Entry {index + 1}</h4>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          const updatedEducation = profile.education.filter(
                            (_, eduIndex) => eduIndex !== index
                          );
                          setProfile((prev) => ({
                            ...prev,
                            education: updatedEducation,
                          }));
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Degree</label>
                        <Input
                          placeholder="Enter your degree"
                          value={edu.degree || ""}
                          onChange={(e) => {
                            const updatedEducation = [...profile.education];
                            updatedEducation[index].degree = e.target.value;
                            setProfile((prev) => ({
                              ...prev,
                              education: updatedEducation,
                            }));
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Field of Study</label>
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
                >
                  Add Education
                </Button>
              </CardContent>
            </Card>

            <Button type="submit" className="w-full bg-blue-600 text-white hover:bg-blue-700">
              Save Changes
            </Button>
          </form>
        </>
      )}
    </div>
  );
};

export default Profile;