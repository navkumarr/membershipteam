import useStore from '../../store/useStore'

export default function ManageTeamModal({ onClose }) {
  const teamMembers = useStore((s) => s.teamMembers)
  const currentUser = useStore((s) => s.currentUser)

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal sm:max-w-sm" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-800 dark:text-white">Team</h3>
          <button onClick={onClose} className="btn-ghost p-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-xs text-gray-400 dark:text-slate-500 mb-4">
          Team members are all users who have signed up. Invite someone by sharing the app URL — they sign up and appear here automatically.
        </p>

        <div className="space-y-1">
          {teamMembers.length === 0 && (
            <p className="text-sm text-gray-400 dark:text-slate-500 italic py-2">No team members yet.</p>
          )}
          {teamMembers.map((member) => {
            const initials = member.name.slice(0, 2).toUpperCase()
            const isYou = member.id === currentUser?.id
            return (
              <div key={member.id} className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-navy-700">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                  style={{ backgroundColor: member.avatarColor }}
                >
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-medium text-gray-800 dark:text-slate-100 truncate">{member.name}</p>
                    {isYou && (
                      <span className="text-xs text-gold font-medium">(you)</span>
                    )}
                  </div>
                  {member.email && (
                    <p className="text-xs text-gray-400 dark:text-slate-500 truncate">{member.email}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-5 flex justify-end">
          <button onClick={onClose} className="btn-secondary">Close</button>
        </div>
      </div>
    </div>
  )
}
