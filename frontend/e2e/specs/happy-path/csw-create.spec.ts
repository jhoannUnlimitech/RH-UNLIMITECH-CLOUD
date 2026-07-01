/**
 * CSW Create Spec — Happy Path.
 *
 * Validates creating a new CSW request:
 * 1. Login as developer
 * 2. Navigate to my-requests
 * 3. Create new solicitud "Permiso"
 * 4. Verify it appears in list with status "Pendiente"
 */

import { createSerialFlow } from '../../fixtures/base';
import {
  loginAndNavigateToMyRequests,
  navigateToNewCSW,
  fillCSWForm,
  submitCSWForm,
  verifyCSWInList,
} from '../../factories/csw.factory';
import { LOGIN_DEVELOPER, CSW_PERMISO } from '../../fixtures/test-data';

const { e2e, getPage } = createSerialFlow();

e2e.describe.serial('CSW — Create Request (Permiso)', () => {
  e2e('login and navigate to my-requests', loginAndNavigateToMyRequests(getPage, LOGIN_DEVELOPER));
  e2e('click create new CSW', navigateToNewCSW(getPage));
  e2e('fill CSW form with Permiso data', fillCSWForm(getPage, CSW_PERMISO));
  e2e('submit CSW form', submitCSWForm(getPage));
  e2e('verify CSW appears in list', verifyCSWInList(getPage, 'Permiso', 'Borrador'));
});
