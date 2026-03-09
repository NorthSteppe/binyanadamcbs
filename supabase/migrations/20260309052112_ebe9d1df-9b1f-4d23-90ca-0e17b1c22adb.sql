
-- Fix 1: Replace broad course-content storage policy with purchase-scoped policy
DROP POLICY IF EXISTS "Authenticated users can view course content" ON storage.objects;

CREATE POLICY "Purchasers or admins can view course content"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'course-content'
    AND (
      public.has_role(auth.uid(), 'admin')
      OR EXISTS (
        SELECT 1 FROM public.course_purchases cp
        WHERE cp.user_id = auth.uid()
          AND storage.objects.name LIKE cp.course_id::text || '/%'
      )
    )
  );

-- Fix 2: Restrict public SELECT on course_lessons to preview-only
DROP POLICY IF EXISTS "Anyone can view lessons of active courses" ON public.course_lessons;

CREATE POLICY "Anyone can view preview lessons of active courses"
  ON public.course_lessons FOR SELECT
  USING (
    is_preview = true
    AND EXISTS (
      SELECT 1 FROM public.courses
      WHERE courses.id = course_lessons.course_id AND courses.is_active = true
    )
  );

CREATE POLICY "Purchasers can view all lessons of purchased courses"
  ON public.course_lessons FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.course_purchases cp
      WHERE cp.course_id = course_lessons.course_id AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all course lessons"
  ON public.course_lessons FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
