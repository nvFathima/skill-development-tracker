import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import axiosInstance from "../utils/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/Table";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select";
import { format } from "date-fns";
import { AlertCircle, Trash2, Plus,LinkIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const SkillGoalManagement = () => {
  const [skills, setSkills] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [newSkill, setNewSkill] = useState({ name: "", description: 'No description provided' });
  const [skillModalOpen, setSkillModalOpen] = useState(false);
  const [goals, setGoals] = useState([]);
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: 'No description provided',
    startDate: "",
    targetCompletionDate: "",
    status: "Pending"
  });
  const [editingGoal, setEditingGoal] = useState(null);
  const [skillDetailsModalOpen, setSkillDetailsModalOpen] = useState(false);
  const [skillDetails, setSkillDetails] = useState(null);

  const handleViewSkillDetails = (skill) => {
    setSkillDetails(skill);
    setSkillDetailsModalOpen(true);
  };

  const refreshGoals = () => {
    if (selectedSkill) {
        fetchGoals(selectedSkill);
    }
  };

  useEffect(() => { fetchSkills(); }, []);

  const fetchSkills = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/skills");
      setSkills(response.data);
    } catch (error) {
      console.error("Error fetching skills:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGoals = async (skillId, skillName) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/goals?skillId=${skillId}`);
      console.log("Goals for skill:", skillId, response.data); // Debugging
      setGoals(response.data);
      setSelectedSkill({ id: skillId, name: skillName }); // Save both ID and name
    } catch (error) {
      console.error("Error fetching goals:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = async () => {
    if (!newSkill.name.trim()) {
      setError("Skill name is required");
      return;
    }

    try {
      setLoading(true);
      const response = await axiosInstance.post("/skills", newSkill);
      setSkills([...skills, response.data]);
      setSkillModalOpen(false);
      setNewSkill({ name: "", description: 'No description provided' });
      setError("");
      refreshGoals();
      toast.success("Skill added successfully");
    } catch (error) {
      setError("Failed to add skill. Please try again.");
      toast.error('Failed to add skill');
      console.error("Error adding skill:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddGoal = async () => {
    if (!newGoal.title.trim() || !newGoal.startDate || !newGoal.targetCompletionDate) {
      setError("Title, start date, and target completion date are required");
      return;
    }
  
    try {
      setLoading(true);
  
      // Parse dates
      const startDate = new Date(newGoal.startDate);
      const targetDate = new Date(newGoal.targetCompletionDate);
  
      // Validate dates in frontend
      if (targetDate < startDate) {
        setError("Target completion date must be on or after the start date");
        return;
      }
  
      const goalData = {
        title: newGoal.title,
        description: newGoal.description || 'No description provided',
        startDate: startDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
        targetCompletionDate: targetDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
        status: newGoal.status || "Pending",
        associatedSkills: [selectedSkill.id]
      };
  
      let response;
      if (editingGoal) {
        response = await axiosInstance.put(`/goals/${editingGoal}`, goalData);
        setGoals(goals.map((goal) => (goal._id === editingGoal ? response.data : goal)));
        toast.success("Goal updated successfully");
      } else {
        response = await axiosInstance.post("/goals", goalData);
        setGoals([...goals, response.data]);
        toast.success("Goal added successfully");
      }
  
      setGoalModalOpen(false);
      setEditingGoal(null);
      setNewGoal({
        title: "",
        description: "",
        startDate: "",
        targetCompletionDate: "",
        status: "Pending",
      });
      setError("");
    } catch (error) {
      toast.error('Failed to add/edit goal');
      console.error('Error:', error.response?.data || error);
      setError(error.response?.data?.details || "Failed to save goal. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSkill = async (skillId) => {
    if (!window.confirm("Are you sure you want to delete this skill?")) {
      return;
    }

    try {
      setLoading(true);
      await axiosInstance.delete(`/skills/${skillId}`);
      setSkills(skills.filter((skill) => skill._id !== skillId));
      if (selectedSkill === skillId) {
        setSelectedSkill(null);
        setGoals([]);
      }
      refreshGoals();
      toast.success("Skill deleted successfully");
      setError("");
    } catch (error) {
      setError("Failed to delete skill. Please try again.");
      console.error("Error deleting skill:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGoal = async (goalId) => {
    if (!window.confirm("Are you sure you want to delete this goal?")) {
      return;
    }

    try {
      setLoading(true);
      await axiosInstance.delete(`/goals/${goalId}`);
      setGoals(goals.filter((goal) => goal._id !== goalId));
      setError("");
      refreshGoals();
      toast.success("Goal removed successfully");
    } catch (error) {
      setError("Failed to delete goal. Please try again.");
      console.error("Error deleting goal:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditGoal = (goal) => {
    console.log("Editing goal:", goal);
    setNewGoal({
      title: goal.title,
      description: goal.description ,
      startDate: goal.startDate.split("T")[0],
      targetCompletionDate: goal.targetCompletionDate.split("T")[0],
      status: goal.status, // Remove the default value here
      associatedSkills: [selectedSkill.id],
    });
    setEditingGoal(goal._id);
    setGoalModalOpen(true);
  }; 

  const handleUnlinkResource = async (goalId, resourceLink) => {
    try {
      await axiosInstance.delete(`/goals/${goalId}/unlink-resource/${encodeURIComponent(resourceLink)}`);
      toast.success("Resource unlinked successfully");
      refreshGoals();
    } catch (error) {
      console.error("Error unlinking resource:", error);
      toast.error("Failed to unlink resource");
    }
  };

  const resetGoalForm = () => {
    setNewGoal({
      title: "",
      description: "No description provided",
      startDate: "",
      targetCompletionDate: "",
      status: "Pending"
    });
    setEditingGoal(null);
  };

  const handleGoalModalClose = (isOpen) => {
    if (!isOpen) {
      resetGoalForm();
    }
    setGoalModalOpen(isOpen);
  };
  const handleGoalModalCancel = () => {
    resetGoalForm();
    setGoalModalOpen(false);
  };

  return (
    <div className="p-6 space-y-10">
      <h2 className="text-3xl font-bold dark:text-white">Skills & Goals Management</h2>

      {/* Alert Box for Errors */}
      {error && (
        <Alert variant="destructive" className="flex items-center space-x-2">
          <AlertCircle className="h-5 w-5" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Skills Section */}
      <div className="space-y-6">
        <div className="flex justify-between items-center border-b pb-2">
          <h3 className="text-2xl font-semibold dark:text-gray-200">Your Skills</h3>
          <Button onClick={() => setSkillModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="mr-2 h-5 w-5" /> Add Skill
          </Button>
        </div>

        <div className="rounded-md border shadow-lg bg-white dark:bg-gray-900">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-200 dark:bg-gray-800">
                <TableHead className="px-4 py-3">Skill Name</TableHead>
                <TableHead className="px-4 py-3">Description</TableHead>
                <TableHead className="px-4 py-3 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {skills.map((skill) => (
                <TableRow key={skill._id} className="even:bg-gray-100 dark:even:bg-gray-800">
                  <TableCell className="px-4 py-3 dark:text-white">{skill.name}</TableCell>
                  <TableCell className="px-4 py-3 dark:text-white">{skill.description}</TableCell>
                  <TableCell className="px-4 py-3 text-right">
                    <div className="flex gap-3 justify-end">
                      <Button variant="outline" onClick={() => handleViewSkillDetails(skill)} className="text-blue-600 border-blue-600 hover:bg-blue-100">
                        View Details
                      </Button>
                      <Button variant="outline" onClick={() => fetchGoals(skill._id, skill.name)} className="text-green-600 border-green-600 hover:bg-green-100">
                        View Goals
                      </Button>
                      <Button variant="destructive" onClick={() => handleDeleteSkill(skill._id)}>
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Goals Section */}
      {selectedSkill && (
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b pb-2">
            <h3 className="text-2xl font-semibold dark:text-gray-200">Goals for {selectedSkill.name}</h3>
            <Button onClick={() => setGoalModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="mr-2 h-5 w-5" /> Add Goal
            </Button>
          </div>

          <div className="rounded-md border shadow-lg bg-white dark:bg-gray-900">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-200 dark:bg-gray-800">
                  <TableHead className="px-4 py-3">Title</TableHead>
                  <TableHead className="px-4 py-3">Status</TableHead>
                  <TableHead className="px-4 py-3">Start Date</TableHead>
                  <TableHead className="px-4 py-3">Target Completion</TableHead>
                  <TableHead className="px-4 py-3">Linked Resources</TableHead>
                  <TableHead className="px-4 py-3 text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {goals.map((goal) => (
                    <TableRow key={goal._id} className="even:bg-gray-100 dark:even:bg-gray-800 dark:text-white">
                      <TableCell className="px-4 py-3">{goal.title}</TableCell>
                      <TableCell className="px-4 py-3 capitalize">{goal.status}</TableCell>
                      <TableCell className="px-4 py-3">{format(new Date(goal.startDate), "MMM d, yyyy")}</TableCell>
                      <TableCell className="px-4 py-3">{format(new Date(goal.targetCompletionDate), "MMM d, yyyy")}</TableCell>
                      <TableCell className="px-4 py-3">
                        {goal.resources.length > 0 ? (
                          <ul className="list-disc pl-4">
                            {goal.resources.map((resource, index) => (
                              <li key={index} className="text-sm flex items-center justify-between group">
                                <div className="flex items-center">
                                  <LinkIcon className="h-4 w-4 mr-2 text-blue-600" />
                                  <a href={resource.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                    {resource.title}
                                  </a>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.preventDefault(); // Prevent link click
                                    handleUnlinkResource(goal._id, resource.link);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 text-red-600 hover:text-red-700 hover:bg-red-50 -mr-2"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-gray-500">No resources linked</span>
                        )}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-right">
                        <div className="flex gap-3 justify-end">
                          <Button variant="outline" onClick={() => handleEditGoal(goal)} className="text-blue-600 border-blue-600 hover:bg-blue-100">
                            Edit
                          </Button>
                          <Button variant="destructive" onClick={() => handleDeleteGoal(goal._id)}>
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Add Skill Dialog */}
      <Dialog open={skillModalOpen} onOpenChange={setSkillModalOpen}>
        <DialogContent className="p-6 max-w-lg shadow-lg dark:bg-gray-900 border dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold dark:text-white">Add New Skill</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="skillName" className="text-gray-700 dark:text-gray-300">Skill Name</label>
              <Input 
                id="skillName"
                value={newSkill.name}
                onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                className="text-lg px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="skillDescription" className="text-gray-700 dark:text-gray-300">Description</label>
              <Textarea 
                id="skillDescription"
                value={newSkill.description}
                onChange={(e) => setNewSkill({ ...newSkill, description: e.target.value })}
                className="text-lg px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-600 dark:text-white"
              />
            </div>
          </div>

          <DialogFooter className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setSkillModalOpen(false)} className="px-6 py-2 text-lg dark:text-gray-500">
              Cancel
            </Button>
            <Button onClick={handleAddSkill} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 text-lg">
              Save Skill
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Skill Details Dialog */}
      <Dialog open={skillDetailsModalOpen} onOpenChange={setSkillDetailsModalOpen}>
        <DialogContent className="p-6 max-w-lg shadow-lg dark:bg-gray-900 border dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold dark:text-white">{skillDetails?.name}</DialogTitle>
          </DialogHeader>

          <div className="space-y-2">
            <p className="text-lg dark:text-gray-300"><strong>Description:</strong> {skillDetails?.description}</p>
          </div>

          <DialogFooter className="flex justify-end mt-4">
            <Button variant="outline" onClick={() => setSkillDetailsModalOpen(false)} className="px-6 py-2 text-lg dark:text-gray-400">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add / Edit Goal Dialog */}
      <Dialog open={goalModalOpen} onOpenChange={handleGoalModalClose}>
        <DialogContent className="p-6 max-w-lg shadow-lg dark:bg-gray-900 border dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold dark:text-white">{editingGoal ? "Edit Goal" : "Add New Goal"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="goalTitle" className="text-gray-700 dark:text-gray-300">Title</label>
              <Input 
                id="goalTitle"
                value={newGoal.title}
                onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                className="text-lg px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="goalDescription" className="text-gray-700 dark:text-gray-300">Description</label>
              <Textarea 
                id="goalDescription"
                value={newGoal.description}
                onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                className="text-lg px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-600 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="goalStartDate" className="text-gray-700 dark:text-gray-300">Start Date</label>
                <Input 
                  id="goalStartDate"
                  type="date"
                  value={newGoal.startDate}
                  onChange={(e) => setNewGoal({ ...newGoal, startDate: e.target.value })}
                  className="text-lg px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="goalTargetDate" className="text-gray-700 dark:text-gray-300">Target Completion Date</label>
                <Input 
                  id="goalTargetDate"
                  type="date"
                  value={newGoal.targetCompletionDate}
                  onChange={(e) => setNewGoal({ ...newGoal, targetCompletionDate: e.target.value })}
                  className="text-lg px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="goalStatus" className="text-gray-700 dark:text-gray-300">Status</label>
              <Select
                value={newGoal.status}
                onValueChange={(value) => setNewGoal((prev) => ({ ...prev, status: value }))}
              >
                <SelectTrigger 
                  id="goalStatus" 
                  className="border border-gray-300 dark:border-gray-600 
                            bg-white dark:bg-gray-800 
                            text-gray-900 dark:text-gray-300 
                            focus:ring-2 focus:ring-blue-600 
                            rounded-md px-4 py-2"
                >
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-lg">
                  <SelectItem 
                    value="Pending" 
                    className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-300"
                  >
                    Pending
                  </SelectItem>
                  <SelectItem 
                    value="In Progress" 
                    className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-300"
                  >
                    In Progress
                  </SelectItem>
                  <SelectItem 
                    value="Completed" 
                    className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-300"
                  >
                    Completed
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="flex justify-end gap-3 mt-4">
            <Button 
              variant="outline" 
              onClick={handleGoalModalCancel} 
              className="px-6 py-2 text-lg dark:text-gray-500"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddGoal} 
              disabled={loading} 
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 text-lg"
            >
              {editingGoal ? "Save Changes" : "Save Goal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default SkillGoalManagement;