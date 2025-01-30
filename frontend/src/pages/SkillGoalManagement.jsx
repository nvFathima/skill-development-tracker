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

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Skills & Goals Management</h2>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Skills Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold">Your Skills</h3>
          <Button onClick={() => setSkillModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Skill
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Skill Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {skills.map((skill) => (
                <TableRow key={skill._id}>
                  <TableCell>{skill.name}</TableCell>
                  <TableCell>{skill.description}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" onClick={() => handleViewSkillDetails(skill)}>
                        View Details
                      </Button>
                      <Button variant="outline" onClick={() => fetchGoals(skill._id, skill.name)}>
                        View Goals
                      </Button>
                      <Button variant="destructive" onClick={() => handleDeleteSkill(skill._id)} >
                        <Trash2 className="h-4 w-4" />
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
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Goals for {selectedSkill.name}</h3>
            <Button onClick={() => setGoalModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Goal
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Target Completion</TableHead>
                  <TableHead>Linked Resources</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {goals.map((goal) => (
                  <React.Fragment key={goal._id}>
                    <TableRow>
                      <TableCell>{goal.title}</TableCell>
                      <TableCell className="capitalize">{goal.status}</TableCell>
                      <TableCell>
                        {format(new Date(goal.startDate), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        {format(new Date(goal.targetCompletionDate), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        {goal.resources && goal.resources.length > 0 ? (
                          <div className="space-y-2">
                            {goal.resources.map((resource, index) => (
                              <div key={index} className="flex items-center justify-between text-sm">
                                <div className="flex items-center">
                                  <LinkIcon className="h-4 w-4 mr-2" />
                                  <a 
                                    href={resource.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800"
                                  >
                                    {resource.title}
                                  </a>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleUnlinkResource(goal._id, resource.link)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-500">No resources linked</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {goal.status === "completed" ? (
                          <span className="text-green-500 font-bold">Completed</span>
                        ) : (
                          <div className="flex space-x-2">
                            <Button variant="outline" onClick={() => handleEditGoal(goal)}>
                              Edit
                            </Button>
                            <Button variant="destructive" onClick={() => handleDeleteGoal(goal._id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Add Skill Dialog */}
      <Dialog open={skillModalOpen} onOpenChange={setSkillModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Skill</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="skillName">Name</label>
              <Input id="skillName" value={newSkill.name}
                onChange={(e) =>
                  setNewSkill({ ...newSkill, name: e.target.value })
                } />
            </div>
            <div className="space-y-2">
              <label htmlFor="skillDescription">Description</label>
              <Textarea id="skillDescription" value={newSkill.description}
                onChange={(e) =>
                  setNewSkill({ ...newSkill, description: e.target.value })
                } />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSkillModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddSkill} disabled={loading}>
              Save Skill
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add skill view dialog */}
      <Dialog open={skillDetailsModalOpen} onOpenChange={setSkillDetailsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{skillDetails?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <p><strong>Description:</strong> {skillDetails?.description}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSkillDetailsModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Goal Dialog */}
      <Dialog open={goalModalOpen} onOpenChange={setGoalModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingGoal ? "Edit Goal" : "Add New Goal"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="goalTitle">Title</label>
              <Input id="goalTitle" value={newGoal.title}
                onChange={(e) =>
                  setNewGoal({ ...newGoal, title: e.target.value })
                } />
            </div>
            <div className="space-y-2">
              <label htmlFor="goalDescription">Description</label>
              <Textarea id="goalDescription" value={newGoal.description}
                onChange={(e) =>
                  setNewGoal({ ...newGoal, description: e.target.value })
                } />
            </div>
            <div className="space-y-2">
              <label htmlFor="goalStartDate">Start Date</label>
              <Input id="goalStartDate" type="date" value={newGoal.startDate}
                onChange={(e) =>
                  setNewGoal({ ...newGoal, startDate: e.target.value })
                } />
            </div>
            <div className="space-y-2">
              <label htmlFor="goalTargetDate">Target Completion Date</label>
              <Input id="goalTargetDate" type="date" value={newGoal.targetCompletionDate}
                onChange={(e) =>
                  setNewGoal({ ...newGoal, targetCompletionDate: e.target.value })
                } />
            </div>
            <div className="space-y-2">
              <label htmlFor="goalStatus">Status</label>
              <Select
                value={newGoal.status}
                onValueChange={(value) => {
                  setNewGoal((prev) => ({
                    ...prev,
                    status: value,
                  }));
                }}
              >
                <SelectTrigger id="goalStatus">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGoalModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddGoal} disabled={loading}>
              {editingGoal ? "Save Changes" : "Save Goal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SkillGoalManagement;