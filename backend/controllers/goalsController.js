const Goal = require('../models/Goals');
const Skill = require('../models/Skills');

// Get goals matching resource skills
const getMatchingGoals = async (req, res) => {
    try {
        const { resourceId } = req.params;
        const { title } = req.query; // Use title instead of skills for matching

        if (!title) {
            return res.status(400).json({ message: "Title parameter is required" });
        }

        // First, find skills that match the resource title keywords
        const keywords = title.toLowerCase()
            .trim()
            .split(/\s+/)
            .filter(keyword => keyword.length > 0)
            .map(keyword => escapeRegExp(keyword));

        if (keywords.length === 0) {
            return res.status(400).json({ message: "No valid keywords provided" });
        }

        // Build a regex pattern that matches any of the keywords
        const regexPattern = keywords.join('|');
        
        const matchingSkills = await Skill.find({
            userId: req.user.id,
            name: { 
                $regex: regexPattern, 
                $options: 'i' 
            }
        });

        const skillIds = matchingSkills.map(skill => skill._id);

        // Then find goals that have any of the matching skills
        const goals = await Goal.find({
            userId: req.user.id,
            associatedSkills: { $in: skillIds }
        }).populate('associatedSkills');

        res.status(200).json(goals);
    } catch (error) {
        console.error('Error fetching matching goals:', error);
        res.status(500).json({ 
            message: "Internal server error",
            details: error.message 
        });
    }
};

// Helper function to escape special regex characters
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Link a resource to a goal
const linkResourceToGoal = async (req, res) => {
    try {
        const { goalId } = req.params;
        const { resourceData } = req.body;

        if (!resourceData || !resourceData.title || !resourceData.platform || !resourceData.link) {
            return res.status(400).json({ message: "Required resource data missing" });
        }

        const goal = await Goal.findOne({ _id: goalId, userId: req.user.id });
        
        if (!goal) {
            return res.status(404).json({ message: "Goal not found" });
        }

        // Check if resource is already linked
        const isResourceLinked = goal.resources.some(r => r.link === resourceData.link);
        if (isResourceLinked) {
            return res.status(400).json({ message: "Resource already linked to this goal" });
        }

        // Duration will be automatically converted by the schema
        goal.resources.push(resourceData);
        const savedGoal = await goal.save();

        res.status(200).json(savedGoal);
    } catch (error) {
        console.error('Error linking resource to goal:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                message: "Validation error", 
                details: error.message 
            });
        }
        res.status(500).json({ message: "Internal server error" });
    }
};

// Remove a resource from a goal
const unlinkResourceFromGoal = async (req, res) => {
    try {
        const { goalId, resourceLink } = req.params;

        const goal = await Goal.findOne({ _id: goalId, userId: req.user.id });
        
        if (!goal) {
            return res.status(404).json({ message: "Goal not found" });
        }

        // Remove the resource with matching link
        goal.resources = goal.resources.filter(r => r.link !== resourceLink);
        await goal.save();

        res.status(200).json(goal);
    } catch (error) {
        console.error('Error unlinking resource from goal:', error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Fetch all goals for a user
const getAllGoals = async (req, res) => {
    try {
        const { skillId } = req.query;
        const query = { userId: req.user.id };
        
        // Add skillId filter if provided
        if (skillId) {
            query.associatedSkills = skillId;
        }
        
        const goals = await Goal.find(query).populate('associatedSkills');
        res.status(200).json(goals);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Add a new goal
const addGoal = async (req, res) => {
    try {
        const { title, description, startDate, targetCompletionDate, associatedSkills,resources} = req.body;
        const newGoal = new Goal({
            userId: req.user.id,
            title,
            description,
            startDate,
            targetCompletionDate,
            associatedSkills,
            resources: resources || []
        });
        const savedGoal = await newGoal.save();
        res.status(201).json(savedGoal);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Update a goal
const updateGoal = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id || req.user._id;

        // Parse dates
        const startDate = new Date(req.body.startDate);
        const targetDate = new Date(req.body.targetCompletionDate);

        // Validate dates manually
        if (targetDate < startDate) {
            return res.status(400).json({
                message: "Validation failed",
                details: "Target completion date must be on or after the start date."
            });
        }

        const goalData = {
            ...req.body,
            userId,
            startDate,
            targetCompletionDate: targetDate
        };

        // Find the goal first to ensure it exists and belongs to the user
        const existingGoal = await Goal.findOne({ _id: id, userId });
        if (!existingGoal) {
            return res.status(404).json({ message: "Goal not found" });
        }

        const updatedGoal = await Goal.findByIdAndUpdate(
            id,
            goalData,
            { 
                new: true, 
                runValidators: false
            }
        );

        console.log('Successfully updated goal:', updatedGoal);
        res.status(200).json(updatedGoal);

    } catch (error) {
        console.error('Goal update error:', error);
        res.status(500).json({ 
            message: "Internal server error",
            details: error.message 
        });
    }
};

// Delete a goal
const deleteGoal = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedGoal = await Goal.findByIdAndDelete(id);
        if (!deletedGoal) return res.status(404).json({ message: "Goal not found" });
        res.status(200).json({ message: "Goal deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = { getAllGoals, addGoal, updateGoal, deleteGoal, getMatchingGoals,linkResourceToGoal,unlinkResourceFromGoal };