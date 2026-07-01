/**
 * CSW Orden de Estudio Spec — Special 1-level approval by Oscar.
 *
 * Flow:
 * 1. Developer creates "Orden de Estudio"
 * 2. Oscar (direct approver) approves → Aprobada
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
} from '../../factories/csw.factory';
import {
  LOGIN_DEVELOPER,
  LOGIN_OSCAR,
  CSW_ORDEN_ESTUDIO,
  APPROVAL_OSCAR,
} from '../../fixtures/test-data';

const { e2e, getPage } = createSerialFlow();

e2e.describe.serial('CSW — Orden de Estudio (1-level: Oscar)', () => {
  // Developer creates the request
  e2e('1. Developer: login and navigate to my-requests',
    loginAndNavigateToMyRequests(getPage, LOGIN_DEVELOPER));
  e2e('2. Developer: create new CSW',
    navigateToNewCSW(getPage));
  e2e('3. Developer: fill form with Orden de Estudio data',
    fillCSWForm(getPage, CSW_ORDEN_ESTUDIO));
  e2e('4. Developer: submit CSW (creates as draft)',
    submitCSWForm(getPage));
  e2e('5. Developer: send draft for approval',
    submitDraftForApproval(getPage));
  e2e('6. Developer: verify CSW in list as Pendiente',
    verifyCSWInList(getPage, 'Orden de Estudio', 'Pendiente'));

  // Oscar approves directly
  e2e('7. Oscar: login and navigate to pending',
    loginAndNavigateToPending(getPage, LOGIN_OSCAR));
  e2e('8. Oscar: open the pending CSW',
    openFirstPendingCSW(getPage));
  e2e('9. Oscar: approve (direct approval)',
    approveCSW(getPage, APPROVAL_OSCAR));

  // Developer verifies approved
  e2e('10. Developer: login and verify CSW approved',
    loginAndNavigateToMyRequests(getPage, LOGIN_DEVELOPER));
  e2e('11. Developer: verify CSW shows as Aprobada',
    verifyCSWInList(getPage, 'Orden de Estudio', 'Aprobada'));
});
