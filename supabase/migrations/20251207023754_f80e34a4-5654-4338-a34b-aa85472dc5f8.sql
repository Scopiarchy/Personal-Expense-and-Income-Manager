-- Add INSERT policy for notifications table
-- Only allow authenticated users to insert notifications for themselves
CREATE POLICY "Users can insert own notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);