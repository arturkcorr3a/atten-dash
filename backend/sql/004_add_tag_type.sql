-- Add tag_type column to tags table
ALTER TABLE public.tags
ADD COLUMN tag_type text DEFAULT 'subject' CHECK (tag_type IN ('subject', 'absence'));

-- Add index for faster filtering by tag_type and user_id
CREATE INDEX idx_tags_user_type ON public.tags(user_id, tag_type);
