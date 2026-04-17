-- Add tag_id to subjects table
ALTER TABLE subjects ADD COLUMN tag_id UUID REFERENCES tags(id) ON DELETE SET NULL;
CREATE INDEX idx_subjects_tag_id ON subjects(tag_id);

-- Add tag_id to absences table
ALTER TABLE absences ADD COLUMN tag_id UUID REFERENCES tags(id) ON DELETE SET NULL;
CREATE INDEX idx_absences_tag_id ON absences(tag_id);

-- Add title to grades table
ALTER TABLE grades ADD COLUMN title TEXT;
CREATE INDEX idx_grades_title ON grades(title);
