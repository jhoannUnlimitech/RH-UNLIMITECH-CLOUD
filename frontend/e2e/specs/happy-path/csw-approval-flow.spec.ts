/**
 * CSW Approval Flow Spec — Full 3-level approval with rejection and resubmit.
 *
 * Flow:
 * 1. Developer creates "Permiso" → Pendiente (0/3)
 * 2. Moises (level 1) approves with comment → (1/3)
 * 3. Manuel (level 2) REJECTS with comment → Rechazado
 * 4. Developer sees rejection banner, edits, resubmits → Pendiente (0/3)
 * 5. Moises (level 1) approves again → (1/3)
 * 6. Manuel (level 2) approves → (2/3)
 * 7. Laura (level 3) approves → Aprobado (3/3)
 *
 * Pre-requisites:
 * - All users exist with Pass2014!
 * - E2E Developer is in División 4 (Infraestructura)
 * - Approval chain: Moises → Manuel → Laura
 */

import { createSerialFlow } from '../../fixtures/base';
import {
  loginAndNavigateToMyRequests,
  navigateToNewCSW,
  fillCSWForm,
  submitCSWForm,
  verifyCSWInList,
  submitDraftForApproval,
  loginAndNavigateToPending,
  openFirstPendingCSW,
  approveCSW,
  rejectCSW,
  editFirstCSWInList,
  verifyRejectionBanner,
  updateCSWForm,
  verifyCSWViewStatus,
} from '../../factories/csw.factory';
import {
  LOGIN_DEVELOPER,
  LOGIN_MOISES,
  LOGIN_MANUEL,
  LOGIN_LAURA,
  CSW_PERMISO,
  APPROVAL_MOISES,
  REJECTION_MANUEL,
  APPROVAL_MANUEL,
  APPROVAL_LAURA,
} from '../../fixtures/test-data';

const { e2e, getPage } = createSerialFlow();

e2e.describe.serial('CSW — Full Approval Flow (3 Levels with Rejection)', () => {
  // === Phase 1: Developer creates the request ===
  e2e('1. Developer: login and navigate to my-requests',
    loginAndNavigateToMyRequests(getPage, LOGIN_DEVELOPER));
  e2e('2. Developer: create new CSW',
    navigateToNewCSW(getPage));
  e2e('3. Developer: fill form with Permiso data',
    fillCSWForm(getPage, CSW_PERMISO));
  e2e('4. Developer: submit CSW (creates as draft)',
    submitCSWForm(getPage));
  e2e('5. Developer: send draft for approval (DRAFT → PENDING)',
    submitDraftForApproval(getPage));
  e2e('6. Developer: verify CSW in list as Pendiente',
    verifyCSWInList(getPage, 'Permiso', 'Pendiente'));

  // === Phase 2: Moises approves level 1 ===
  e2e('7. Moises: login and navigate to pending',
    loginAndNavigateToPending(getPage, LOGIN_MOISES));
  e2e('8. Moises: open the pending CSW',
    openFirstPendingCSW(getPage));
  e2e('9. Moises: approve level 1 with comment',
    approveCSW(getPage, APPROVAL_MOISES));

  // === Phase 3: Manuel rejects level 2 ===
  e2e('10. Manuel: login and navigate to pending',
    loginAndNavigateToPending(getPage, LOGIN_MANUEL));
  e2e('11. Manuel: open the pending CSW',
    openFirstPendingCSW(getPage));
  e2e('12. Manuel: reject level 2 with comment',
    rejectCSW(getPage, REJECTION_MANUEL));

  // === Phase 4: Developer edits and resubmits ===
  e2e('13. Developer: login and navigate to my-requests',
    loginAndNavigateToMyRequests(getPage, LOGIN_DEVELOPER));
  e2e('14. Developer: verify CSW shows as Rechazada',
    verifyCSWInList(getPage, 'Permiso', 'Rechazada'));
  e2e('15. Developer: edit the rejected CSW',
    editFirstCSWInList(getPage));
  e2e('16. Developer: verify rejection banner visible',
    verifyRejectionBanner(getPage, 'Manuel Lara'));
  e2e('17. Developer: update and resubmit CSW',
    updateCSWForm(getPage));
  e2e('18. Developer: send resubmitted draft for approval',
    submitDraftForApproval(getPage));
  e2e('19. Developer: verify CSW back to Pendiente',
    verifyCSWInList(getPage, 'Permiso', 'Pendiente'));

  // === Phase 5: Moises approves again (level 1) ===
  e2e('20. Moises: login and navigate to pending',
    loginAndNavigateToPending(getPage, LOGIN_MOISES));
  e2e('21. Moises: open the pending CSW',
    openFirstPendingCSW(getPage));
  e2e('22. Moises: approve level 1 again',
    approveCSW(getPage, APPROVAL_MOISES));

  // === Phase 6: Manuel approves (level 2) ===
  e2e('23. Manuel: login and navigate to pending',
    loginAndNavigateToPending(getPage, LOGIN_MANUEL));
  e2e('24. Manuel: open the pending CSW',
    openFirstPendingCSW(getPage));
  e2e('25. Manuel: approve level 2',
    approveCSW(getPage, APPROVAL_MANUEL));

  // === Phase 7: Laura approves (level 3) — FINAL ===
  e2e('26. Laura: login and navigate to pending',
    loginAndNavigateToPending(getPage, LOGIN_LAURA));
  e2e('27. Laura: open the pending CSW',
    openFirstPendingCSW(getPage));
  e2e('28. Laura: approve level 3 (final)',
    approveCSW(getPage, APPROVAL_LAURA));

  // === Phase 8: Developer verifies approved ===
  e2e('29. Developer: login and verify CSW is Aprobada',
    loginAndNavigateToMyRequests(getPage, LOGIN_DEVELOPER));
  e2e('30. Developer: verify CSW shows as Aprobada',
    verifyCSWInList(getPage, 'Permiso', 'Aprobada'));
});
