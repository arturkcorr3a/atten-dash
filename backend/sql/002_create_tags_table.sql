-- Create tags table
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6366F1',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, name)
);

-- Create index on user_id for faster queries
CREATE INDEX idx_tags_user_id ON tags(user_id);

-- Enable RLS
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own tags
CREATE POLICY "Users can view their own tags" ON tags
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can create tags
CREATE POLICY "Users can create their own tags" ON tags
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own tags
CREATE POLICY "Users can update their own tags" ON tags
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can delete their own tags
CREATE POLICY "Users can delete their own tags" ON tags
  FOR DELETE
  USING (auth.uid() = user_id);
