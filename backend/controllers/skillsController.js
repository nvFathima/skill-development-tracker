const Skill = require('../models/Skills');
const Goal = require("../models/Goals");

const getMatchingSkills = async (req, res) => {
    try {
      const { keywords } = req.query;
      
      if (!keywords) {
        return res.status(400).json({ message: "Keywords parameter is required" });
      }
  
      const keywordArray = keywords.split(',')
      .map(k => k.trim())
      .filter(k => k.length > 3);  // Ignore short words
      const regexPattern = keywordArray.join('|');
      
      const matchingSkills = await Skill.find({
        userId: req.user.id,
        name: { 
          $regex: regexPattern, 
          $options: 'i' 
        }
      });
  
      res.status(200).json(matchingSkills);
    } catch (error) {
      console.error('Error fetching matching skills:', error);
      res.status(500).json({ 
        message: "Internal server error",
        details: error.message 
      });
    }
};

// Fetch all skills for a user
const getAllSkills = async (req, res) => {
    try {
        const skills = await Skill.find({ userId: req.user.id });
        res.status(200).json(skills);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Add a new skill
const addSkill = async (req, res) => {
    try {
        const { name, description } = req.body;
        const newSkill = new Skill({
            userId: req.user.id,
            name,
            description,
        });
        const savedSkill = await newSkill.save();
        res.status(201).json(savedSkill);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Update a skill
const updateSkill = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedSkill = await Skill.findByIdAndUpdate(
            id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedSkill) return res.status(404).json({ message: "Skill not found" });
        res.status(200).json(updatedSkill);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Delete a skill
const deleteSkill = async (req, res) => {
    try {
        const skillId = req.params.id;
        const skill = await Skill.findById(skillId);

        if (!skill) {
            return res.status(404).json({ message: "Skill not found" });
        }

        // Delete associated goals
        await Goal.deleteMany({ associatedSkills: skillId });

        // Delete the skill
        await Skill.findByIdAndDelete(skillId);

        res.status(200).json({ message: "Skill and associated goals deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = { getAllSkills, addSkill, updateSkill, deleteSkill, getMatchingSkills };
