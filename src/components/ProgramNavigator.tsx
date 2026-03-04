'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

type ProgramNavigatorProps = {
  catalog: any[];
  currentProgramId?: string;
  currentDepartmentId?: string;
};

export default function ProgramNavigator({
  catalog,
  currentProgramId,
  currentDepartmentId,
}: ProgramNavigatorProps) {
  const router = useRouter();

  const departments = useMemo(() => {
    return (catalog || []).flatMap((faculty: any) =>
      (faculty.departments || []).map((dept: any) => ({
        id: dept.id,
        name: dept.name,
        facultyName: faculty.name,
        programs: dept.programs || [],
      }))
    );
  }, [catalog]);

  const [departmentId, setDepartmentId] = useState(currentDepartmentId || departments[0]?.id || '');
  const [programId, setProgramId] = useState(currentProgramId || '');

  useEffect(() => {
    if (currentDepartmentId) {
      setDepartmentId(currentDepartmentId);
    }
  }, [currentDepartmentId]);

  useEffect(() => {
    if (currentProgramId) {
      setProgramId(currentProgramId);
    }
  }, [currentProgramId]);

  const programs = useMemo(() => {
    return departments.find((d) => d.id === departmentId)?.programs || [];
  }, [departments, departmentId]);

  useEffect(() => {
    if (!departmentId) return;
    if (programId && programs.some((p: any) => p.id === programId)) return;
    if (programs.length > 0) {
      setProgramId(programs[0].id);
    } else {
      setProgramId('');
    }
  }, [departmentId, programs, programId]);

  const handleProgramChange = (value: string) => {
    setProgramId(value);
    if (value) {
      router.push(`/academics/programs/${value}`);
    }
  };

  if (!departments.length) return null;

  return (
    <div className="mt-6 grid gap-3 md:grid-cols-2">
      <select
        value={departmentId}
        onChange={(e) => setDepartmentId(e.target.value)}
        className="w-full rounded-lg border border-neutral/60 bg-white px-4 py-3 text-base outline-none focus:ring-2 focus:ring-accent"
      >
        {departments.map((dept) => (
          <option key={dept.id} value={dept.id}>
            {dept.name}{dept.facultyName ? ` (${dept.facultyName})` : ''}
          </option>
        ))}
      </select>
      <select
        value={programId}
        onChange={(e) => handleProgramChange(e.target.value)}
        className="w-full rounded-lg border border-neutral/60 bg-white px-4 py-3 text-base outline-none focus:ring-2 focus:ring-accent"
      >
        {programs.length === 0 ? (
          <option value="">No programs available</option>
        ) : (
          programs.map((prog: any) => (
            <option key={prog.id} value={prog.id}>
              {prog.name} ({prog.degree})
            </option>
          ))
        )}
      </select>
    </div>
  );
}
