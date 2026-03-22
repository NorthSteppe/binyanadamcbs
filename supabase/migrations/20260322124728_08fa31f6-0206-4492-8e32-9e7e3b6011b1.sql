
-- Re-create triggers that don't use net.http_post
CREATE TRIGGER on_staff_todo_change
  AFTER INSERT OR UPDATE ON public.staff_todos
  FOR EACH ROW EXECUTE FUNCTION public.notify_staff_todo_change();

CREATE TRIGGER on_session_change
  AFTER INSERT OR UPDATE OR DELETE ON public.sessions
  FOR EACH ROW EXECUTE FUNCTION public.notify_session_change();

CREATE TRIGGER on_new_message
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.notify_new_message();

CREATE TRIGGER on_new_profile
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.notify_admins_new_user();

CREATE TRIGGER on_team_request
  AFTER INSERT ON public.team_requests
  FOR EACH ROW EXECUTE FUNCTION public.notify_admins_team_request();
