import { observer } from "mobx-react-lite";
import { useEffect, useState, useMemo } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Label from "../form/Label";
import InputField from "../form/input/InputField";
import TextArea from "../form/input/TextArea";
import SearchableSelect from "../form/SearchableSelect";
import apiClient from "../../api/client";
import { notify } from "../../utils/toast";
import { divisionsService } from "../../api/services/divisions";
import { employeesService } from "../../api/services/employees";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  projectId?: string | null;
}

const statusOptions = [
  { value: "active", label: "Activo" },
  { value: "on_hold", label: "En Pausa" },
  { value: "completed", label: "Completado" },
  { value: "cancelled", label: "Cancelado" },
];

const ProjectFormModal = observer(({ isOpen, onClose, onSuccess, projectId }: Props) => {
  const isEdit = Boolean(projectId);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    divisionId: "",
    status: "active",
    leadId: "",
    members: [] as string[],
    repositories: [] as { name: string; url: string; type: string }[],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [divisions, setDivisions] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");

  // Reset form
  useEffect(() => {
    if (!isOpen) {
      setFormData({ name: "", code: "", description: "", divisionId: "", status: "active", leadId: "", members: [], repositories: [] });
      setErrors({});
    }
  }, [isOpen]);

  // Load data for selectors
  useEffect(() => {
    if (isOpen) loadSelectData();
  }, [isOpen]);

  // Load project data for edit
  useEffect(() => {
    if (isOpen && isEdit && projectId) loadProjectData();
  }, [isOpen, projectId]);

  const loadSelectData = async () => {
    setLoadingData(true);
    try {
      const [divsData, empsData] = await Promise.all([
        divisionsService.getAll(),
        employeesService.getAll({ limit: 200 }),
      ]);
      setDivisions(Array.isArray(divsData) ? divsData : []);
      const empsList = empsData.data || empsData;
      setEmployees(Array.isArray(empsList) ? empsList : []);
    } catch { /* silent */ } finally { setLoadingData(false); }
  };

  const loadProjectData = async () => {
    try {
      const res = await apiClient.get(`/projects/${projectId}`);
      const p = res.data?.data;
      if (p) {
        setFormData({
          name: p.name || "",
          code: p.code || "",
          description: p.description || "",
          divisionId: p.divisionId?._id || p.divisionId || "",
          status: p.status || "active",
          leadId: p.leadId?._id || p.leadId || "",
          members: (p.members || []).map((m: any) => m._id || m),
          repositories: p.repositories || [],
        });
      }
    } catch { /* silent */ }
  };

  const divisionOptions = useMemo(() => divisions.map(d => ({ value: d._id, label: `${d.name} (${d.code})` })), [divisions]);
  const employeeOptions = useMemo(() => employees.map(e => ({ value: e._id, label: `${e.name}${e.role?.name ? ` (${e.role.name})` : ""}` })), [employees]);
  const filteredEmployeesForMembers = useMemo(() => {
    if (!memberSearch) return employees;
    const s = memberSearch.toLowerCase();
    return employees.filter(e => e.name.toLowerCase().includes(s) || e.email?.toLowerCase().includes(s) || e.role?.name?.toLowerCase().includes(s));
  }, [employees, memberSearch]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = "El nombre es requerido";
    if (!formData.code.trim()) errs.code = "El código es requerido";
    if (!formData.divisionId) errs.divisionId = "Debe seleccionar una división";
    if (!formData.leadId) errs.leadId = "Debe seleccionar un líder";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      if (isEdit && projectId) {
        await apiClient.put(`/projects/${projectId}`, formData);
        notify.success("Proyecto actualizado exitosamente");
      } else {
        await apiClient.post("/projects", formData);
        notify.success("Proyecto creado exitosamente");
      }
      onSuccess();
    } catch (err: any) {
      notify.error(err.response?.data?.message || "Error al guardar proyecto");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMember = (empId: string) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.includes(empId)
        ? prev.members.filter(id => id !== empId)
        : [...prev.members, empId]
    }));
  };

  const addRepository = () => {
    setFormData(prev => ({
      ...prev,
      repositories: [...prev.repositories, { name: "", url: "", type: "github" }]
    }));
  };

  const removeRepository = (index: number) => {
    setFormData(prev => ({
      ...prev,
      repositories: prev.repositories.filter((_, i) => i !== index)
    }));
  };

  const updateRepository = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      repositories: prev.repositories.map((r, i) => i === index ? { ...r, [field]: value } : r)
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="relative w-full max-w-[700px] m-5 sm:m-0 rounded-3xl bg-white p-6 lg:p-8 dark:bg-gray-900">
      <div className="max-h-[75vh] overflow-y-auto pr-1">
        <h4 className="text-xl font-semibold text-gray-800 dark:text-white mb-1">
          {isEdit ? "Editar Proyecto" : "Nuevo Proyecto"}
        </h4>
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
          {isEdit ? "Actualiza la información del proyecto" : "Completa los datos del nuevo proyecto"}
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {loadingData ? (
            <div className="space-y-4 animate-pulse">
              <div className="grid grid-cols-2 gap-4">
                <div className="h-11 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                <div className="h-11 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              </div>
              <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-11 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                <div className="h-11 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              </div>
              <div className="h-11 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              <div className="h-[150px] bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            </div>
          ) : (
          <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Nombre */}
            <div>
              <Label htmlFor="name">Nombre <span className="text-red-500">*</span></Label>
              <InputField id="name" name="name" type="text" placeholder="Ej: MasterTech" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} error={errors.name} />
            </div>
            {/* Código */}
            <div>
              <Label htmlFor="code">Código <span className="text-red-500">*</span></Label>
              <InputField id="code" name="code" type="text" placeholder="Ej: MTECH" value={formData.code} onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))} error={errors.code} />
            </div>
          </div>

          {/* Descripción */}
          <div>
            <Label htmlFor="description">Descripción</Label>
            <TextArea id="description" name="description" placeholder="Descripción del proyecto..." value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} rows={2} />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* División */}
            <div>
              <SearchableSelect id="divisionId" label="División" options={[{ value: "", label: "Seleccionar división" }, ...divisionOptions]} value={formData.divisionId} onChange={(v) => setFormData(prev => ({ ...prev, divisionId: v }))} placeholder="Buscar..." error={errors.divisionId} disabled={loadingData} required />
            </div>
            {/* Estado */}
            <div>
              <SearchableSelect id="status" label="Estado" options={statusOptions} value={formData.status} onChange={(v) => setFormData(prev => ({ ...prev, status: v }))} placeholder="Estado..." />
            </div>
          </div>

          {/* Líder */}
          <div>
            <SearchableSelect id="leadId" label="Líder del Proyecto" options={[{ value: "", label: "Seleccionar líder" }, ...employeeOptions]} value={formData.leadId} onChange={(v) => setFormData(prev => ({ ...prev, leadId: v }))} placeholder="Buscar líder..." error={errors.leadId} disabled={loadingData} required />
          </div>

          {/* Miembros del equipo */}
          <div>
            <Label>Miembros del Equipo ({formData.members.length} seleccionados)</Label>
            <input
              type="text"
              placeholder="Buscar personas..."
              className="w-full mt-2 mb-2 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-hidden focus:border-brand-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              onChange={(e) => setMemberSearch(e.target.value)}
            />
            <div className="max-h-[200px] overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-1">
              {filteredEmployeesForMembers.map(emp => (
                <label key={emp._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-white/[0.03] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.members.includes(emp._id)}
                    onChange={() => toggleMember(emp._id)}
                    className="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800"
                  />
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-xs font-medium text-brand-700 dark:text-brand-300">
                      {emp.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-white">{emp.name}</p>
                      <p className="text-xs text-gray-500">{emp.role?.name || ""}</p>
                    </div>
                  </div>
                </label>
              ))}
              {filteredEmployeesForMembers.length === 0 && (
                <p className="text-sm text-center text-gray-500 py-3">No se encontraron personas</p>
              )}
            </div>
          </div>

          {/* Links asociados */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Links asociados</Label>
              <button type="button" onClick={addRepository} className="text-sm text-brand-600 hover:text-brand-700 dark:text-brand-400 font-medium">
                + Agregar
              </button>
            </div>
            {formData.repositories.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 italic">Sin links asociados</p>
            )}
            <div className="space-y-2">
              {formData.repositories.map((repo, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Nombre"
                    value={repo.name}
                    onChange={(e) => updateRepository(idx, "name", e.target.value)}
                    className="w-[140px] px-3 py-2 text-sm border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:outline-hidden focus:border-brand-500"
                  />
                  <input
                    type="url"
                    placeholder="https://..."
                    value={repo.url}
                    onChange={(e) => updateRepository(idx, "url", e.target.value)}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:outline-hidden focus:border-brand-500"
                  />
                  <button type="button" onClick={() => removeRepository(idx)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg dark:hover:bg-red-900/20 shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting || loadingData}>
              {isSubmitting ? "Guardando..." : isEdit ? "Actualizar" : "Crear Proyecto"}
            </Button>
          </div>
          </>
          )}
        </form>
      </div>
    </Modal>
  );
});

export default ProjectFormModal;
