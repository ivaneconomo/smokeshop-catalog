export default function Toggle({ checked, onChange, label }) {
  return (
    <label className='flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200'>
      <input
        type='checkbox'
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label}
    </label>
  );
}
