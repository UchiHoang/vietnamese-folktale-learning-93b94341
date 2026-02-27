
-- Tạo bảng parental_settings để phụ huynh cài đặt giới hạn thời gian
CREATE TABLE public.parental_settings (
  user_id UUID NOT NULL PRIMARY KEY,
  daily_limit_minutes INTEGER DEFAULT NULL,
  limit_enabled BOOLEAN NOT NULL DEFAULT false,
  extra_time_used BOOLEAN NOT NULL DEFAULT false,
  last_reset_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.parental_settings ENABLE ROW LEVEL SECURITY;

-- Users can view their own settings
CREATE POLICY "Users can view own parental_settings"
ON public.parental_settings FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own settings
CREATE POLICY "Users can insert own parental_settings"
ON public.parental_settings FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own settings
CREATE POLICY "Users can update own parental_settings"
ON public.parental_settings FOR UPDATE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_parental_settings_updated_at
BEFORE UPDATE ON public.parental_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
