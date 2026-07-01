// src/pages/hod/timetable/TimetablePage.jsx
// HOD creates a timetable for a batch+semester, adds slots, then submits to Admin.
// Status: draft → submitted → returned | approved

import { useState } from 'react'
import { PageHeader }  from '@/components/ui/PageHeader'
import { Button }      from '@/components/ui/Button'
import { Input }       from '@/components/ui/Input'
import { Select }      from '@/components/ui/Select'
import { Modal }       from '@/components/ui/Modal'
import { Badge }       from '@/components/ui/Badge'
import { CardLoader }  from '@/components/ui/Loader'
import { useSessions } from '@/hooks/useSessions'
import { useSubjects } from '@/hooks/useSubjects'
import { useFaculties, useMyDepartmentId } from '@/hooks/useFaculties'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/api/client'
import useUiStore from '@/store/ui.store'
import { parseApiError } from '@/utils/errorHandler'

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
const SLOT_TYPES = [{ value:'lecture',label:'Lecture' },{ value:'lab',label:'Lab' },{ value:'tutorial',label:'Tutorial' }]
const STATUS_COLOR = { draft:'var(--text-muted)', submitted:'var(--accent-sky)', returned:'var(--danger)', approved:'var(--success)' }

// ── API helpers ───────────────────────────────────────────────
async function fetchTimetables() { const r = await apiClient.get('/api/timetables'); return r.data }
async function createTimetable(p) { const r = await apiClient.post('/api/timetables', p); return r.data }
async function addSlot(timetableId, p) { const r = await apiClient.post(`/api/timetables/${timetableId}/slots`, p); return r.data }
async function removeSlot(slotId) { const r = await apiClient.delete(`/api/timetable-slots/${slotId}`); return r.data }
async function submitTimetable(id) { const r = await apiClient.patch(`/api/timetables/${id}/submit`); return r.data }

// ── Hooks ─────────────────────────────────────────────────────
function useTimetables() {
  return useQuery({ queryKey:['timetables'], queryFn: async () => { const r = await fetchTimetables(); return r.data ?? [] } })
}
function useCreateTimetable() {
  const qc = useQueryClient(); const { toastSuccess, toastError } = useUiStore()
  return useMutation({ mutationFn: createTimetable, onSuccess: () => { qc.invalidateQueries({queryKey:['timetables']}); toastSuccess('Timetable created.') }, onError: e => toastError(parseApiError(e).message) })
}
function useAddSlot() {
  const qc = useQueryClient(); const { toastSuccess, toastError } = useUiStore()
  return useMutation({ mutationFn: ({timetableId,...p}) => addSlot(timetableId, p), onSuccess: () => { qc.invalidateQueries({queryKey:['timetables']}); toastSuccess('Slot added.') }, onError: e => toastError(parseApiError(e).message) })
}
function useRemoveSlot() {
  const qc = useQueryClient(); const { toastError } = useUiStore()
  return useMutation({ mutationFn: removeSlot, onSuccess: () => qc.invalidateQueries({queryKey:['timetables']}), onError: e => toastError(parseApiError(e).message) })
}
function useSubmitTimetable() {
  const qc = useQueryClient(); const { toastSuccess, toastError } = useUiStore()
  return useMutation({ mutationFn: submitTimetable, onSuccess: () => { qc.invalidateQueries({queryKey:['timetables']}); toastSuccess('Timetable submitted to admin.') }, onError: e => toastError(parseApiError(e).message) })
}

// ── Create timetable modal ────────────────────────────────────
function CreateTimetableModal({ isOpen, onClose }) {
  const [form, setForm] = useState({ sessionId:'', batchYear:'', semesterNumber:'' })
  const { data: sessions = [] } = useSessions()
  const { mutate: create, isPending } = useCreateTimetable()
  const sessionOpts = sessions.filter(s=>['upcoming','active'].includes(s.status)).map(s=>({ value:String(s.id), label:s.name }))

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.sessionId||!form.batchYear||!form.semesterNumber) return
    create({ sessionId:Number(form.sessionId), batchYear:Number(form.batchYear), semesterNumber:Number(form.semesterNumber) },
      { onSuccess: () => { setForm({sessionId:'',batchYear:'',semesterNumber:''}); onClose() }})
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Timetable" maxWidth={400}>
      <form onSubmit={handleSubmit} noValidate>
        <div style={{ display:'flex',flexDirection:'column',gap:14 }}>
          <Select label="Session" value={form.sessionId} onChange={e=>setForm(p=>({...p,sessionId:e.target.value}))} options={sessionOpts} placeholder="Select session" required />
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12 }}>
            <Input label="Semester" value={form.semesterNumber} onChange={e=>setForm(p=>({...p,semesterNumber:e.target.value}))} placeholder="1–8" required />
            <Input label="Batch year" value={form.batchYear} onChange={e=>setForm(p=>({...p,batchYear:e.target.value}))} placeholder="e.g. 2022" required />
          </div>
        </div>
        <Modal.Footer>
          <Button variant="ghost" type="button" onClick={onClose} disabled={isPending}>Cancel</Button>
          <Button type="submit" variant="primary" loading={isPending} loadingText="Creating...">Create</Button>
        </Modal.Footer>
      </form>
    </Modal>
  )
}

// ── Add slot modal ────────────────────────────────────────────
function AddSlotModal({ isOpen, onClose, timetableId }) {
  const [form, setForm] = useState({ subjectId:'', facultyId:'', dayOfWeek:'', startTime:'', endTime:'', classroom:'', slotType:'lecture' })
  const { data: subjects  = [] } = useSubjects()
  // Scope the Faculty dropdown to the HOD's own department — a bare
  // useFaculties() returns every faculty member in the whole school.
  const myDeptId = useMyDepartmentId()
  const { data: faculties = [], isLoading: facultiesLoading } = useFaculties(myDeptId)
  const { mutate: addSlotMut, isPending } = useAddSlot()
  const dayOpts     = DAYS.map((d,i) => ({ value:String(i+1), label:d }))
  const subjectOpts = subjects.map(s => ({ value:String(s.id), label:`${s.courseCode} — ${s.name}` }))
  const facultyOpts = faculties.map(f => ({ value:String(f.userId), label:f.user.name }))
  const facultyLoading = myDeptId == null || facultiesLoading

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.subjectId||!form.facultyId||!form.dayOfWeek||!form.startTime||!form.endTime||!form.classroom) return
    addSlotMut({ timetableId, subjectId:Number(form.subjectId), facultyId:Number(form.facultyId),
      dayOfWeek:Number(form.dayOfWeek), startTime:form.startTime, endTime:form.endTime,
      classroom:form.classroom.trim(), slotType:form.slotType },
      { onSuccess: () => { setForm({subjectId:'',facultyId:'',dayOfWeek:'',startTime:'',endTime:'',classroom:'',slotType:'lecture'}); onClose() }})
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Slot" maxWidth={460}>
      <form onSubmit={handleSubmit} noValidate>
        <div style={{ display:'flex',flexDirection:'column',gap:14 }}>
          <Select label="Subject"     value={form.subjectId}  onChange={e=>setForm(p=>({...p,subjectId:e.target.value}))}  options={subjectOpts} placeholder="Select subject"  required />
          <Select label="Faculty"     value={form.facultyId}  onChange={e=>setForm(p=>({...p,facultyId:e.target.value}))}  options={facultyOpts}
            disabled={facultyLoading}
            placeholder={facultyLoading ? 'Loading your department…' : 'Select faculty'}  required />
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12 }}>
            <Select label="Day"       value={form.dayOfWeek}  onChange={e=>setForm(p=>({...p,dayOfWeek:e.target.value}))}  options={dayOpts}     placeholder="Select day"      required />
            <Select label="Type"      value={form.slotType}   onChange={e=>setForm(p=>({...p,slotType:e.target.value}))}   options={SLOT_TYPES}  />
          </div>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12 }}>
            <Input  label="Start time" type="time" value={form.startTime} onChange={e=>setForm(p=>({...p,startTime:e.target.value}))} required />
            <Input  label="End time"   type="time" value={form.endTime}   onChange={e=>setForm(p=>({...p,endTime:e.target.value}))}   required />
          </div>
          <Input label="Classroom / Lab" value={form.classroom} onChange={e=>setForm(p=>({...p,classroom:e.target.value}))} placeholder="e.g. EE-101" required />
        </div>
        <Modal.Footer>
          <Button variant="ghost" type="button" onClick={onClose} disabled={isPending}>Cancel</Button>
          <Button type="submit" variant="primary" loading={isPending} loadingText="Adding...">Add slot</Button>
        </Modal.Footer>
      </form>
    </Modal>
  )
}

// ── Main page ─────────────────────────────────────────────────
export default function TimetablePage() {
  const [createOpen,  setCreateOpen]  = useState(false)
  const [slotTarget,  setSlotTarget]  = useState(null) // timetable id
  const { data: timetables = [], isLoading } = useTimetables()
  const { mutate: submit,    isPending: submitting } = useSubmitTimetable()
  const { mutate: removeSlotMut, isPending: removing } = useRemoveSlot()

  return (
    <div>
      <PageHeader title="Timetable"
        subtitle="Build department timetables and submit to admin for approval"
        action={<Button variant="primary" onClick={() => setCreateOpen(true)}>+ New Timetable</Button>}
      />

      {isLoading ? (
        <div style={{ display:'flex',flexDirection:'column',gap:12 }}>{[1,2].map(i=><CardLoader key={i} lines={3}/>)}</div>
      ) : timetables.length === 0 ? (
        <div style={{ textAlign:'center',padding:'64px 20px',background:'var(--bg-surface)',border:'1px solid var(--border-subtle)',borderRadius:'var(--radius-lg)' }}>
          <p style={{ color:'var(--text-muted)',marginBottom:12 }}>No timetables yet.</p>
          <Button variant="accent" size="sm" onClick={() => setCreateOpen(true)}>Create first timetable</Button>
        </div>
      ) : (
        <div style={{ display:'flex',flexDirection:'column',gap:20 }}>
          {timetables.map(tt => (
            <div key={tt.id} style={{ background:'var(--bg-surface)',border:'1px solid var(--border-subtle)',borderRadius:'var(--radius-lg)',overflow:'hidden' }}>
              {/* Header */}
              <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 20px',background:'var(--bg-elevated)',borderBottom:'1px solid var(--border-subtle)' }}>
                <div>
                  <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:4 }}>
                    <h3 style={{ margin:0,fontSize:'0.925rem',fontWeight:700,color:'var(--text-primary)' }}>
                      Semester {tt.semesterNumber} · Batch {tt.batchYear}
                    </h3>
                    <span style={{ fontSize:'0.75rem',fontWeight:600,padding:'2px 10px',borderRadius:99,
                      background:`${STATUS_COLOR[tt.status]}18`, border:`1px solid ${STATUS_COLOR[tt.status]}35`,
                      color:STATUS_COLOR[tt.status] }}>{tt.status}</span>
                  </div>
                  <p style={{ margin:0,fontSize:'0.75rem',color:'var(--text-muted)' }}>
                    {tt.slots?.length ?? 0} slots · {tt.session?.name}
                  </p>
                </div>
                <div style={{ display:'flex',gap:8 }}>
                  {tt.status === 'draft' && (
                    <>
                      <Button variant="accent" size="sm" onClick={() => setSlotTarget(tt.id)}>+ Add Slot</Button>
                      <Button variant="primary" size="sm" loading={submitting} onClick={() => submit(tt.id)}>Submit to Admin</Button>
                    </>
                  )}
                  {tt.status === 'returned' && (
                    <>
                      <Button variant="accent" size="sm" onClick={() => setSlotTarget(tt.id)}>+ Add Slot</Button>
                      <Button variant="primary" size="sm" loading={submitting} onClick={() => submit(tt.id)}>Resubmit</Button>
                    </>
                  )}
                  {tt.status === 'approved' && (
                    <span style={{ fontSize:'0.78rem',color:'var(--success)',fontWeight:600 }}>✓ Approved & active</span>
                  )}
                </div>
              </div>

              {/* Admin comment if returned */}
              {tt.adminComment && tt.status === 'returned' && (
                <div style={{ padding:'10px 20px',background:'rgba(248,113,113,0.06)',borderBottom:'1px solid var(--border-subtle)' }}>
                  <p style={{ margin:0,fontSize:'0.8rem',color:'var(--danger)' }}>
                    <strong>Admin comment:</strong> {tt.adminComment}
                  </p>
                </div>
              )}

              {/* Slots table */}
              {(tt.slots ?? []).length > 0 && (
                <>
                  <div style={{ display:'grid',gridTemplateColumns:'100px 2fr 2fr 60px 80px 80px auto',gap:10,padding:'8px 20px',background:'var(--bg-elevated)',borderBottom:'1px solid var(--border-subtle)' }}>
                    {['Day','Subject','Faculty','Type','Start','End',''].map(h=>(
                      <span key={h} style={{ fontSize:'0.68rem',fontWeight:600,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.05em' }}>{h}</span>
                    ))}
                  </div>
                  {[...tt.slots].sort((a,b)=>a.dayOfWeek-b.dayOfWeek||(a.startTime>b.startTime?1:-1)).map((slot,i)=>(
                    <div key={slot.id} style={{ display:'grid',gridTemplateColumns:'100px 2fr 2fr 60px 80px 80px auto',gap:10,padding:'11px 20px',alignItems:'center',borderBottom:i<tt.slots.length-1?'1px solid var(--border-subtle)':'none',transition:'background 0.12s' }}
                      onMouseEnter={e=>e.currentTarget.style.background='var(--bg-elevated)'}
                      onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                    >
                      <p style={{ margin:0,fontSize:'0.82rem',fontWeight:600,color:'var(--text-primary)' }}>{DAYS[slot.dayOfWeek-1]}</p>
                      <p style={{ margin:0,fontSize:'0.82rem',color:'var(--text-primary)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{slot.subject?.name}</p>
                      <p style={{ margin:0,fontSize:'0.82rem',color:'var(--text-secondary)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{slot.faculty?.user?.name}</p>
                      <p style={{ margin:0,fontSize:'0.75rem',color:'var(--text-muted)',textTransform:'capitalize' }}>{slot.slotType}</p>
                      <p style={{ margin:0,fontSize:'0.82rem',color:'var(--text-secondary)',fontFamily:'var(--font-mono)' }}>{slot.startTime}</p>
                      <p style={{ margin:0,fontSize:'0.82rem',color:'var(--text-secondary)',fontFamily:'var(--font-mono)' }}>{slot.endTime}</p>
                      {['draft','returned'].includes(tt.status) && (
                        <button onClick={() => removeSlotMut(slot.id)} disabled={removing}
                          style={{ background:'none',border:'none',color:'var(--danger)',cursor:'pointer',fontSize:14,padding:'2px 6px' }}>✕</button>
                      )}
                    </div>
                  ))}
                </>
              )}
            </div>
          ))}
        </div>
      )}

      <CreateTimetableModal isOpen={createOpen} onClose={() => setCreateOpen(false)} />
      <AddSlotModal isOpen={!!slotTarget} onClose={() => setSlotTarget(null)} timetableId={slotTarget} />
    </div>
  )
}
