const express = require("express");
const router = express.Router();
const Resource = require("../models/Resource");

router.get("/", async (req, res) => {
  try {
    const { category, search, verified } = req.query;
    let query = {};

    if (category) query.category = category;
    if (verified) query.verified = verified === "true";

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const resources = await Resource.find(query);
    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { title, url, description, category, verified } = req.body;
    const resource = new Resource({
      title,
      url,
      description,
      category,
      verified,
    });
    await resource.save();
    res.status(201).json(resource);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put("/:resourceId", async (req, res) => {
  try {
    const { title, url, description, category, verified } = req.body;
    const resource = await Resource.findByIdAndUpdate(
      req.params.resourceId,
      { title, url, description, category, verified },
      { new: true }
    );
    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }
    res.json(resource);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete("/:resourceId", async (req, res) => {
  try {
    const resource = await Resource.findByIdAndDelete(req.params.resourceId);
    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }
    res.json({ message: "Resource deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
