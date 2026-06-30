// src/hooks/useInvite.js
// React Query mutation for inviting a new user (admin / hod).

import { useMutation } from '@tanstack/react-query'
import * as authApi from '@/api/auth.api'
import useUiStore from '@/store/ui.store'
import { parseApiError } from '@/utils/errorHandler'

/**
 * useInvite — sends an invitation (POST /api/auth/invite).
 *
 * On success: shows a toast telling the inviter the login details were emailed.
 * On error:   shows the backend error message (e.g. domain mismatch, duplicate).
 *
 * Usage:
 *   const { mutate: invite, isPending } = useInvite()
 *   invite({ email, name, role }, { onSuccess })
 */
export function useInvite() {
  const { toastSuccess, toastError } = useUiStore()

  return useMutation({
    mutationFn: authApi.inviteUser,
    onSuccess: (_res, vars) => {
      toastSuccess(`Invite sent to ${vars.email}. Login details have been emailed.`)
    },
    onError: (err) => toastError(parseApiError(err).message),
  })
}
