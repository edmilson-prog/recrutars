// PRD-073: Redirect antigo curriculos -> perfil
import { Navigate } from 'react-router-dom';

export default function Curriculums() {
  return <Navigate to="/candidato/perfil" replace />;
}
