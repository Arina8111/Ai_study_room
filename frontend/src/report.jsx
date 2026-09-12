import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft, Award, CheckCircle2, AlertCircle, XCircle, FileText } from 'lucide-react';

const reportDefinitions = [
  {
    id: 'linked-list', subject: 'Data Structures', topic: 'Linked List', date: '12 September 2026', duration: '15 minutes', score: 73,
    breakdown: [['Conceptual Understanding', 76], ['Answer Accuracy', 73], ['Completeness', 69], ['Confidence', 75], ['Communication', 72], ['Response Consistency', 74]],
    strengths: ['Understands the node-based structure of linked lists.', 'Uses relevant examples for insertion and deletion.', 'Explains dynamic memory allocation confidently.'],
    improvements: ['Revise traversal edge cases and null-pointer handling.', 'Explain time complexity more precisely.'],
    revisionTopics: ['Linked-list traversal', 'Pointer updates', 'Time complexity'],
    questions: [
      ['What is a linked list?', 'Correct', 'Clear definition and a suitable example.'], ['What does a node contain?', 'Correct', 'Correctly described data and link fields.'], ['Why use a linked list instead of an array?', 'Partial', 'Mentioned dynamic size but missed memory trade-offs.'], ['How do you insert at the beginning?', 'Correct', 'Explained the pointer update accurately.'], ['What is traversal?', 'Correct', 'Correct explanation of visiting each node.'], ['What happens when the head is null?', 'Incorrect', 'Confused an empty list with a list containing one node.'], ['What is the search complexity?', 'Partial', 'Correctly said linear but did not explain why.'], ['How do you delete a node?', 'Correct', 'Explained link reassignment well.'], ['What is a tail node?', 'Correct', 'Correctly identified its null next pointer.'], ['Give a linked-list use case.', 'Correct', 'Provided a relevant playlist example.'],
    ],
  },
  {
    id: 'singly-linked-list', subject: 'Data Structures', topic: 'Singly Linked List', date: '12 September 2026', duration: '12 minutes', score: 61,
    breakdown: [['Conceptual Understanding', 65], ['Answer Accuracy', 61], ['Completeness', 56], ['Confidence', 63], ['Communication', 60], ['Response Consistency', 62]],
    strengths: ['Recognizes the one-way connection between nodes.', 'Can describe insertion at the head.', 'Attempts answers independently.'],
    improvements: ['Review deletion when the target is the first or last node.', 'Practice explaining predecessor pointers and traversal.'],
    revisionTopics: ['Deletion cases', 'Head and tail handling', 'Singly linked-list traversal'],
    questions: [
      ['What is a singly linked list?', 'Correct', 'Correctly described one directional links.'], ['How many links does each node have?', 'Correct', 'Correctly stated one next link.'], ['Can it traverse backward?', 'Correct', 'Correctly explained that it cannot directly.'], ['How is a new head inserted?', 'Correct', 'Accurate pointer update sequence.'], ['How do you delete the first node?', 'Partial', 'Basic idea was right but missed updating head safely.'], ['How do you delete the last node?', 'Incorrect', 'Did not identify the need to locate the predecessor.'], ['What is the complexity of access by index?', 'Partial', 'Stated O(n) without explaining traversal.'], ['What does the last node point to?', 'Correct', 'Correctly answered null.'], ['What is a disadvantage over arrays?', 'Partial', 'Mentioned slower access but not lack of locality.'], ['Give a use case.', 'Correct', 'Provided a suitable queue example.'],
    ],
  },
  {
    id: 'doubly-linked-list', subject: 'Data Structures', topic: 'Doubly Linked List', date: '12 September 2026', duration: '18 minutes', score: 88,
    breakdown: [['Conceptual Understanding', 90], ['Answer Accuracy', 88], ['Completeness', 85], ['Confidence', 89], ['Communication', 87], ['Response Consistency', 88]],
    strengths: ['Explains previous and next links precisely.', 'Handles insertion and deletion cases confidently.', 'Compares doubly and singly linked lists accurately.'],
    improvements: ['Mention the extra memory cost consistently.', 'Use clearer terminology for boundary nodes.'],
    revisionTopics: ['Memory overhead', 'Boundary-node cases', 'Pointer consistency'],
    questions: [
      ['What is a doubly linked list?', 'Correct', 'Clear definition with both links identified.'], ['What fields does a node have?', 'Correct', 'Correctly listed data, previous, and next.'], ['Can it traverse in both directions?', 'Correct', 'Explained forward and backward traversal.'], ['Why use it over a singly linked list?', 'Correct', 'Accurately explained easier backward movement.'], ['What is its memory drawback?', 'Correct', 'Correctly mentioned the additional pointer.'], ['How do you insert before a node?', 'Correct', 'Pointer updates were complete and ordered.'], ['How do you delete a middle node?', 'Correct', 'Explained both neighbour links accurately.'], ['What does head.previous contain?', 'Partial', 'Correct answer but needed more precise wording.'], ['What does tail.next contain?', 'Correct', 'Correctly answered null.'], ['Give an application.', 'Correct', 'Relevant browser-history example.'],
    ],
  },
  {
    id: 'circular-linked-list', subject: 'Data Structures', topic: 'Circular Linked List', date: '12 September 2026', duration: '14 minutes', score: 76,
    breakdown: [['Conceptual Understanding', 79], ['Answer Accuracy', 76], ['Completeness', 72], ['Confidence', 78], ['Communication', 75], ['Response Consistency', 76]],
    strengths: ['Understands the circular connection at the tail.', 'Explains round-robin use cases well.', 'Identifies the need for a traversal stopping condition.'],
    improvements: ['Revise empty-list and single-node cases.', 'Explain the traversal termination condition precisely.'],
    revisionTopics: ['Circular traversal', 'Single-node list', 'Insertion at tail'],
    questions: [
      ['What is a circular linked list?', 'Correct', 'Correctly explained that tail points back to head.'], ['What makes it different from a normal list?', 'Correct', 'Clearly identified the non-null tail link.'], ['How do you stop traversal?', 'Partial', 'Mentioned head but omitted the first-iteration condition.'], ['What is a suitable application?', 'Correct', 'Good round-robin scheduling example.'], ['Can a circular list have one node?', 'Incorrect', 'Did not explain that it points to itself.'], ['How do you insert at the end?', 'Correct', 'Correct pointer update sequence.'], ['What is an empty circular list?', 'Partial', 'Basic idea was correct but unclear.'], ['What is the search complexity?', 'Correct', 'Correctly identified linear time.'], ['What is a danger during traversal?', 'Correct', 'Correctly described infinite loops.'], ['How is deletion handled?', 'Correct', 'Explained link updates with a relevant example.'],
    ],
  },
];

export const vivaReportSummaries = reportDefinitions.map(({ id, topic, score }) => ({ id, topic, score: (score / 10).toFixed(1) }));

export default function Report() {
  const { reportId } = useParams();
  const report = reportDefinitions.find((item) => item.id === reportId);
  if (!report) return <Navigate to="/viva-sessions" replace />;
  const performance = report.score >= 85 ? 'Excellent' : report.score >= 70 ? 'Good' : 'Needs Practice';

  return <div className="max-w-5xl mx-auto space-y-6 pb-12">
    <header className="relative bg-[#393E46]/50 border border-[#948979]/25 rounded-3xl p-6 md:p-8 text-center">
      <Link to="/viva-sessions" className="absolute left-4 top-4 md:left-6 md:top-6 inline-flex items-center gap-2 text-xs text-[#948979] hover:text-[#DFD0B8]"><ArrowLeft className="w-4 h-4" />Back to Sessions</Link>
      <div className="mx-auto w-11 h-11 rounded-2xl bg-[#222831] border border-[#948979]/30 grid place-items-center"><FileText className="w-5 h-5" /></div>
      <h1 className="mt-3 text-2xl md:text-3xl font-extrabold">Viva Session Report</h1>
      <p className="mt-1 text-sm text-[#948979]">{report.subject} · {report.topic}</p>
      <p className="mt-2 text-xs text-[#948979]">{report.date} · {report.duration} · 10 questions asked</p>
    </header>

    <section className="grid md:grid-cols-[1fr_auto] gap-5 bg-[#393E46] border border-[#948979]/30 rounded-3xl p-6 md:p-8">
      <div><p className="text-xs uppercase tracking-wider font-bold text-[#948979]">Overall Performance</p><h2 className="text-2xl font-extrabold mt-2">{performance}</h2><p className="text-sm text-[#DFD0B8]/80 mt-2">The session was completed successfully. Review the targeted topics before your next viva.</p></div>
      <div className={`rounded-3xl p-5 text-center min-w-36 ${report.score >= 70 ? 'bg-emerald-500/15 text-emerald-300' : 'bg-amber-500/15 text-amber-200'}`}><Award className="w-6 h-6 mx-auto mb-1" /><p className="text-3xl font-extrabold">{report.score}/100</p><p className="text-xs uppercase font-bold tracking-wider mt-1">{report.score >= 70 ? 'Passed' : 'Practice needed'}</p></div>
    </section>

    <section className="bg-[#393E46] border border-[#948979]/30 rounded-3xl p-6 md:p-8"><h2 className="font-extrabold text-xl mb-4">Performance Breakdown</h2><div className="grid sm:grid-cols-2 gap-3">{report.breakdown.map(([label, value]) => <div key={label} className="bg-[#222831]/70 rounded-2xl p-4 flex justify-between items-center"><span className="text-sm text-[#DFD0B8]/80">{label}</span><strong>{value}%</strong></div>)}</div></section>

    <section className="bg-[#393E46] border border-[#948979]/30 rounded-3xl p-6 md:p-8"><h2 className="font-extrabold text-xl mb-4">Question-wise Performance</h2><div className="space-y-3">{report.questions.map(([question, result, detail], index) => <QuestionResult key={question} number={index + 1} question={question} result={result} detail={detail} />)}</div></section>

    <section className="grid md:grid-cols-2 gap-5"><ListCard title="Strengths" items={report.strengths} tone="good" /><ListCard title="Areas for Improvement" items={report.improvements} tone="warn" /></section>
    <section className="bg-[#393E46] border border-[#948979]/30 rounded-3xl p-6 md:p-8"><h2 className="font-extrabold text-xl">AI Assessment</h2><p className="mt-3 text-sm leading-relaxed text-[#DFD0B8]/80">The student showed {performance.toLowerCase()} understanding of {report.topic}. Focus on precision, completeness, and technical terminology in the recommended revision areas.</p><h3 className="font-bold mt-5">Recommended Revision Topics</h3><ol className="mt-2 list-decimal pl-5 text-sm text-[#DFD0B8]/80 space-y-1">{report.revisionTopics.map((topic) => <li key={topic}>{topic}</li>)}</ol></section>
  </div>;
}

function QuestionResult({ number, question, result, detail }) {
  const Icon = result === 'Correct' ? CheckCircle2 : result === 'Partial' ? AlertCircle : XCircle;
  const color = result === 'Correct' ? 'text-emerald-400' : result === 'Partial' ? 'text-amber-300' : 'text-rose-400';
  return <div className="rounded-2xl bg-[#222831]/70 border border-[#948979]/20 p-4 flex gap-3"><Icon className={`w-5 h-5 shrink-0 ${color}`} /><div><h3 className="font-bold text-sm">Q{number}. {question}</h3><p className={`text-xs font-semibold mt-1 ${color}`}>{result} — <span className="font-normal text-[#DFD0B8]/75">{detail}</span></p></div></div>;
}

function ListCard({ title, items, tone }) {
  return <section className={`rounded-3xl border p-6 ${tone === 'good' ? 'bg-emerald-500/5 border-emerald-500/25' : 'bg-amber-500/5 border-amber-500/25'}`}><h2 className="font-extrabold text-xl">{title}</h2><ul className="list-disc pl-5 mt-3 space-y-2 text-sm text-[#DFD0B8]/80">{items.map((item) => <li key={item}>{item}</li>)}</ul></section>;
}
