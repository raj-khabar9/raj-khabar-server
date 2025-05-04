import tableStructure from "../models/table-structure.js";

export const createTableStructure = async (req, res) => {
  const { name, slug, description, columns } = req.body;

  if (!name || !slug || !columns) {
    return res.status(400).json({
      success: false,
      message: "Name, slug, and columns are required"
    });
  }

  try {
    const existingTable = await tableStructure.findOne({ slug });
    if (existingTable) {
      return res.status(400).json({
        success: false,
        message: `Table with slug ${slug} already exists`
      });
    }
  } catch (error) {
    console.error("Error checking existing table:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }

  try {
    const newTable = new tableStructure({
      name,
      slug,
      description,
      columns
    });

    await newTable.save();

    return res.status(201).json({
      success: true,
      message: "Table created successfully",
      data: newTable
    });
  } catch (error) {
    console.error("Error creating table:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};
