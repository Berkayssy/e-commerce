import React from 'react';
import { useNavigate } from 'react-router-dom';

const Contact = () => {
  const navigate = useNavigate();
  return (
    <div style={{minHeight:'60vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center'}}>
      <h1>Contact Us</h1>
      <p>You can reach us at <a href="mailto:info@galeria.com">info@galeria.com</a> or use the support form for your inquiries.</p>
      <button style={{marginTop:'2rem',padding:'0.6rem 1.3rem',borderRadius:'8px',background:'#232946',color:'#fff',border:'1.5px solid #c084fc',fontWeight:700,fontSize:'1rem',cursor:'pointer'}} onClick={() => navigate(-1)}>
        ← Go Back
      </button>
    </div>
  );
};

export default Contact; 