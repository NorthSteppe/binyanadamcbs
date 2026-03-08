import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Client {
  id: string;
  full_name: string;
}

interface ClientSelectorProps {
  value: string;
  onChange: (clientId: string) => void;
}

const ClientSelector = ({ value, onChange }: ClientSelectorProps) => {
  const { isAdmin } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    const fetchClients = async () => {
      if (isAdmin) {
        const { data } = await supabase.from("profiles").select("id, full_name").order("full_name");
        if (data) setClients(data);
      } else {
        // Therapist: only assigned clients
        const { data: assignments } = await supabase
          .from("client_assignments")
          .select("client_id");
        if (assignments) {
          const ids = assignments.map((a) => a.client_id);
          if (ids.length > 0) {
            const { data } = await supabase
              .from("profiles")
              .select("id, full_name")
              .in("id", ids)
              .order("full_name");
            if (data) setClients(data);
          }
        }
      }
    };
    fetchClients();
  }, [isAdmin]);

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select client..." />
      </SelectTrigger>
      <SelectContent>
        {clients.map((c) => (
          <SelectItem key={c.id} value={c.id}>
            {c.full_name || "Unnamed"}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default ClientSelector;
