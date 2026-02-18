import mongoose, { Schema, Document, Model } from "mongoose"

export interface ILead extends Document {
  name: string
  email: string
  phone?: string
  company?: string
  message: string
  source: string
  status: "new" | "contacted" | "qualified" | "closed"
  createdAt: Date
  updatedAt: Date
}

const LeadSchema = new Schema<ILead>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    company: { type: String, trim: true },
    message: { type: String, required: true },
    source: { type: String, default: "site" },
    status: {
      type: String,
      enum: ["new", "contacted", "qualified", "closed"],
      default: "new",
    },
  },
  { timestamps: true }
)

const Lead: Model<ILead> =
  mongoose.models.Lead || mongoose.model<ILead>("Lead", LeadSchema)

export default Lead
