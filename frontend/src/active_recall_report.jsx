import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft, Brain, CheckCircle2, AlertCircle, CircleX } from 'lucide-react';

const reports = [
  { id: 'linked-list', topic: 'Linked List', accuracy: 58, feedback: 'You recalled the basic structure, but several important operations need another pass.', recommendation: 'It is okay to score lower at first—try again and focus on the missing topics.', missing: ['Traversal and search complexity', 'Deletion at a specific position', 'Handling an empty list'], incorrect: ['Arrays and linked lists do not have the same insertion cost; linked lists avoid shifting elements when the node is known.'], strengths: ['A node stores data and a reference to the next node.', 'Linked lists can grow dynamically.'] },
  { id: 'singly-linked-list', topic: 'Singly Linked List', accuracy: 84, feedback: 'Strong recall of the core structure and common operations.', recommendation: 'Well done—your recall accuracy is good. Review the small gaps to make it even stronger.', missing: ['Deletion of the final node'], incorrect: ['A singly linked list cannot move directly backward because nodes only store next references.'], strengths: ['One-way node links were explained correctly.', 'Head insertion and traversal were accurately recalled.', 'You identified linear access time.'] },
  { id: 'doubly-linked-list', topic: 'Doubly Linked List', accuracy: 68, feedback: 'You recalled both links correctly, but the pointer-update sequence needs more precision.', recommendation: 'It is okay to score lower at first—try again and focus on the missing topics.', missing: ['Boundary cases for head and tail', 'Memory overhead of the previous pointer'], incorrect: ['Deleting a middle node requires updating both the previous node’s next link and the next node’s previous link.'], strengths: ['Nodes contain both previous and next references.', 'Backward traversal was identified as an advantage.'] },
  { id: 'circular-linked-list', topic: 'Circular Linked List', accuracy: 94, feedback: 'Excellent coverage of circular structure, traversal safety, and practical uses.', recommendation: 'Well done—your recall accuracy is very good.', missing: [], incorrect: [], strengths: ['The tail-to-head connection was recalled precisely.', 'You explained the traversal stopping condition.', 'Round-robin scheduling was a relevant application.', 'Single-node circular lists were correctly described.'] },
];

export default function ActiveRecallReport() {
  const { reportId } = useParams();
  const report = reports.find((item) => item.id === reportId);
  if (!report) return <Navigate to="/active-recall" replace />;
  const isGood = report.accuracy >= 70;
  return <div className="max-w-5xl mx-auto space-y-6 pb-12">
    <header className="relative rounded-3xl border border-[#948979]/25 bg-[#393E46]/50 p-6 md:p-8 text-center">
      <Link to="/active-recall" className="absolute left-4 top-4 md:left-6 md:top-6 inline-flex gap-2 items-center text-xs text-[#948979] hover:text-[#DFD0B8]"><ArrowLeft className="w-4 h-4" />Back to Sessions</Link>
      <div className="mx-auto grid place-items-center w-11 h-11 rounded-2xl bg-[#222831] border border-[#948979]/30"><Brain className="w-5 h-5" /></div>
      <h1 className="mt-3 text-2xl md:text-3xl font-extrabold">Active Recall Report</h1><p className="mt-1 text-sm text-[#948979]">{report.topic}</p>
    </header>
    <section className="grid md:grid-cols-[1fr_auto] gap-5 rounded-3xl bg-[#393E46] border border-[#948979]/30 p-6 md:p-8"><div><h2 className="text-xl font-extrabold">Your Recall Result</h2><p className="mt-2 text-sm leading-relaxed text-[#DFD0B8]/80">{report.feedback}</p></div><div className={`rounded-3xl px-6 py-4 text-center ${isGood ? 'bg-emerald-500/15 text-emerald-300' : 'bg-amber-500/15 text-amber-200'}`}><span className="block text-3xl font-extrabold">{report.accuracy}%</span><span className="text-xs font-bold uppercase tracking-wider">Accuracy</span></div></section>
    <p className={`rounded-2xl p-4 text-sm font-semibold ${isGood ? 'bg-emerald-500/10 text-emerald-200' : 'bg-amber-500/10 text-amber-100'}`}>{report.recommendation}</p>
    <div className="grid md:grid-cols-2 gap-5"><ReportCard title="Missing Topics" items={report.missing} empty="No major topics were missed." icon={AlertCircle} tone="amber" /><ReportCard title="Incorrect Points" items={report.incorrect} empty="No factual inaccuracies found." icon={CircleX} tone="rose" /></div>
    <ReportCard title="What You Remembered Well" items={report.strengths} empty="Keep practising to strengthen recall." icon={CheckCircle2} tone="green" />
  </div>;
}

function ReportCard({ title, items, empty, icon: Icon, tone }) {
  const color = tone === 'green' ? 'text-emerald-400' : tone === 'rose' ? 'text-rose-400' : 'text-amber-300';
  return <section className="rounded-3xl bg-[#393E46] border border-[#948979]/30 p-6"><h2 className="flex items-center gap-2 text-lg font-extrabold"><Icon className={`w-5 h-5 ${color}`} />{title}</h2>{items.length ? <ul className="mt-4 list-disc pl-5 space-y-2 text-sm text-[#DFD0B8]/80">{items.map((item) => <li key={item}>{item}</li>)}</ul> : <p className="mt-4 text-sm text-[#948979]">{empty}</p>}</section>;
}
