export const Button=({children,variant='primary',className='',...p})=><button className={`btn btn-${variant} ${className}`} {...p}>{children}</button>;
export const Card=({children,className=''})=><div className={`card ${className}`}>{children}</div>;
export const Badge=({children,tone='neutral'})=><span className={`badge badge-${tone}`}>{children}</span>;
export const Loader=({label='Loading...'})=><div className="loader"><span className="spinner"/>{label}</div>;
export const EmptyState=({icon='○',title,description,children})=><div className="empty"><div className="empty-icon">{icon}</div><h3>{title}</h3><p>{description}</p>{children}</div>;
export const Toast=({message,type='success',onClose})=>message?<div className={`toast toast-${type}`} role="status">{message}<button onClick={onClose}>×</button></div>:null;
