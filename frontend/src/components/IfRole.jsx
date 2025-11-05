// client/src/components/IfRole.jsx
import { useMemo } from 'react';
const IfRole = ({ role, children }) => {
  const me = JSON.parse(localStorage.getItem('user')||'{}');
  const ok = useMemo(()=> me.role && ([].concat(role).includes(me.role)), [me, role]);
  return ok ? children : null;
};
export default IfRole;
