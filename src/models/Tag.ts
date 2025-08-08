import mongoose, { Document, Schema, models } from 'mongoose';

const createSlug = (name: string): string => {
  if (!name) return '';

  const a = 'àáâäæãåāăąçćčđďèéêëēėęěğǵḧîïíīįìłḿñńǹňôöòóœøōõőṕŕřßśšşșťțûüùúūǘůűųẃẍÿýžźż·/_,:;';
  const b = 'aaaaaaaaaacccddeeeeeeeegghiiiiiilmnnnnoooooooooprrsssssttuuuuuuuuuwxyyzzz------';
  const p = new RegExp(a.split('').join('|'), 'g');

  return name.toString().toLowerCase()
    .replace(/#|\$/g, '')
    .replace(p, c => b.charAt(a.indexOf(c)))
    .replace(/&/g, '-and-')
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\//g, '-')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};


export interface ITag extends Document {
  name: string;
  slug: string;
}

const TagSchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, unique: true, index: true }
}, { timestamps: true });

TagSchema.pre<ITag>('save', function(next) {
  if (this.isModified('name') || this.isNew) {
    this.slug = createSlug(this.name);
  }
  next();
});

const Tag = models.Tag || mongoose.model<ITag>('Tag', TagSchema);
export default Tag;