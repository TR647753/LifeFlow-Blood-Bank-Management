import React from 'react';
import {useLocation,useNavigate} from 'react-router-dom';
import {DonorCollectionRoute,SharedRoutePlanner} from '../components/Maps';
export default function RoutePage(){
 const navigate=useNavigate();const {state}=useLocation();
 const {kind,request,camp,camps=[],start='',destination=''}=state||{};
 return <main className="container py-4"><button className="btn btn-outline-secondary mb-3" onClick={()=>navigate(-1)}>← Back to dashboard</button>
 <h2>LifeFlow — View Route</h2>
 {!state?<div className="alert alert-warning">Open this page using a View Route button in your dashboard.</div>:
 kind==='donor-request'?<DonorCollectionRoute request={request} camps={camps} onClose={()=>navigate(-1)}/>:
 <SharedRoutePlanner key={JSON.stringify(state)} title={kind==='camp'?'Route to blood donation camp':'Blood bank to patient hospital route'} initialStart={start} initialDestination={destination} startLabel={kind==='camp'?'Donor starting address':'Blood bank pickup address'} endLabel={kind==='camp'?'Blood camp address':'Patient hospital address'}/>}
 </main>
}
