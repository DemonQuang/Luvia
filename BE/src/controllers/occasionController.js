import Occasion from "../models/occasion.js";

// GET ALL (PUBLIC, ACTIVE ONLY)
export const getAllOccasions = async (req, res) => {
    try {
        const occasions = await Occasion.find({ status: "active" }).sort({ displayOrder: 1 });
        res.status(200).json({
            success: true,
            data: occasions
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET ALL FOR ADMIN (INCLUDING INACTIVE)
export const getAdminOccasions = async (req, res) => {
    try {
        const occasions = await Occasion.find({}).sort({ displayOrder: 1 });
        res.status(200).json({
            success: true,
            data: occasions
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// CREATE (ADMIN)
export const createOccasion = async (req, res) => {
    try {
        const { name, slug, icon, description, displayOrder, status } = req.body;
        if (!name || !slug) {
            return res.status(400).json({ success: false, message: "Name and Slug are required" });
        }

        const existing = await Occasion.findOne({ slug: slug.toLowerCase() });
        if (existing) {
            return res.status(409).json({ success: false, message: "Occasion slug already exists" });
        }

        const occasion = await Occasion.create({
            name,
            slug: slug.toLowerCase(),
            icon: icon || "",
            description: description || "",
            displayOrder: displayOrder || 0,
            status: status || "active"
        });

        res.status(201).json({
            success: true,
            message: "Occasion created successfully",
            data: occasion
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// UPDATE (ADMIN)
export const updateOccasion = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, slug, icon, description, displayOrder, status } = req.body;

        const occasion = await Occasion.findById(id);
        if (!occasion) {
            return res.status(404).json({ success: false, message: "Occasion not found" });
        }

        if (slug && slug.toLowerCase() !== occasion.slug) {
            const existing = await Occasion.findOne({ slug: slug.toLowerCase() });
            if (existing) {
                return res.status(409).json({ success: false, message: "Occasion slug already exists" });
            }
            occasion.slug = slug.toLowerCase();
        }

        occasion.name = name || occasion.name;
        occasion.icon = icon !== undefined ? icon : occasion.icon;
        occasion.description = description !== undefined ? description : occasion.description;
        occasion.displayOrder = displayOrder !== undefined ? displayOrder : occasion.displayOrder;
        occasion.status = status || occasion.status;

        await occasion.save();

        res.status(200).json({
            success: true,
            message: "Occasion updated successfully",
            data: occasion
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// DELETE (ADMIN)
export const deleteOccasion = async (req, res) => {
    try {
        const { id } = req.params;
        const occasion = await Occasion.findById(id);
        if (!occasion) {
            return res.status(404).json({ success: false, message: "Occasion not found" });
        }

        await occasion.deleteOne();
        res.status(200).json({
            success: true,
            message: "Occasion deleted successfully"
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
