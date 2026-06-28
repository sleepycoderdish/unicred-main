// src/pages/student/reappear/ReappearPage.jsx
// Student views their reappear applications and can withdraw pending ones.
// Applying for reappear is done from ResultsPage — not here.

import { PageHeader }               from '@/components/ui/PageHeader'
import { Button }                   from '@/components/ui/Button'
import { Badge }                    from '@/components/ui/Badge'
import { CardLoader }               from '@/components/ui/Loader'
import { useMyReappearApplications, useWithdrawApplication } from '@/hooks/useReappear'

export default function ReappearPage() {
  const { data: applications = [], isLoading } = useMyReappearApplications()
  const { mutate: withdraw, isPending: withdrawing } = useWithdrawApplication()

  return (
    <div>
      <PageHeader title="My Reappear Applications"
        subtitle="Track the status of your reappear requests"
      />

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1,2].map(i => <CardLoader key={i} lines={2} />)}
        </div>
      ) : applications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 20px', background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
          <p style={{ color: 'var(--text-muted)' }}>
            No reappear applications. Apply from the Results page if you have failed subjects.
          </p>
        </div>
      ) : (
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          {applications.map((app, idx) => (
            <div key={app.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 16,
              padding: '16px 20px',
              borderBottom: idx < applications.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                    {app.subject?.name}
                  </p>
                  <Badge type="status" value={app.status} />
                </div>
                <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {app.session?.name}
                </p>
                <p style={{ margin: '6px 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)',
                  background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)',
                  padding: '6px 10px', display: 'inline-block' }}>
                  "{app.reason}"
                </p>
                {/* HOD comment shown after review */}
                {app.hodComment && (
                  <p style={{ margin: '6px 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    HOD: {app.hodComment}
                  </p>
                )}
              </div>

              {/* Withdraw only for pending */}
              {app.status === 'pending' && (
                <Button variant="ghost" size="sm" loading={withdrawing}
                  onClick={() => withdraw(app.id)}>
                  Withdraw
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
