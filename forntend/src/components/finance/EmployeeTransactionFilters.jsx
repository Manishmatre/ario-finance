import React from 'react';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { FiSearch, FiCalendar } from 'react-icons/fi';

export default function EmployeeTransactionFilters({ filters, setFilters, reset, setPage }) {
  return (
    <div className="flex flex-1 flex-wrap items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
      <div className="relative flex items-center">
        <FiSearch className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <Input
          value={filters.name}
          onChange={e => { setPage(1); setFilters(f => ({ ...f, name: e.target.value })); }}
          className="w-44 pl-8 h-9 min-h-[36px] rounded focus:ring-2 focus:ring-blue-500 border-gray-300 transition-all duration-150"
          placeholder="Employee name"
        />
      </div>
      <div className="flex items-center">
        <Select
          value={filters.type}
          onChange={e => { setPage(1); setFilters(f => ({ ...f, type: e.target.value })); }}
          className="w-28 h-9 min-h-[36px] rounded focus:ring-2 focus:ring-blue-500 border-gray-300 transition-all duration-150 align-middle"
          options={[
            { value: '', label: 'All Types' },
            { value: 'salary', label: 'Salary' },
            { value: 'advance', label: 'Advance' },
          ]}
        />
      </div>
      <div className="flex gap-2 items-center">
        <div className="relative flex items-center">
          <FiCalendar className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <Input
            type="date"
            value={filters.dateFrom}
            onChange={e => { setPage(1); setFilters(f => ({ ...f, dateFrom: e.target.value })); }}
            className="w-32 pl-8 h-9 min-h-[36px] rounded focus:ring-2 focus:ring-blue-500 border-gray-300 transition-all duration-150"
          />
        </div>
        <span className="text-gray-400 px-1">-</span>
        <div className="relative flex items-center">
          <Input
            type="date"
            value={filters.dateTo}
            onChange={e => { setPage(1); setFilters(f => ({ ...f, dateTo: e.target.value })); }}
            className="w-32 h-9 min-h-[36px] rounded focus:ring-2 focus:ring-blue-500 border-gray-300 transition-all duration-150"
          />
        </div>
      </div>
      <Button
        type="button"
        variant="outline"
        className="h-9 min-h-[36px] px-4 text-xs border-gray-300 hover:border-gray-400 align-middle"
        onClick={() => { reset(); setFilters({ name: '', type: '', dateFrom: '', dateTo: '' }); setPage(1); }}
      >
        Reset
      </Button>
    </div>
  );
} 