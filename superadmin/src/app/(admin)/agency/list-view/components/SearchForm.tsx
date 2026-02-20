"use client";

import IconifyIcon from '@/components/wrappers/IconifyIcon';

interface SearchFormProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const SearchForm = ({ searchTerm, onSearchChange }: SearchFormProps) => {
  return (
    <form className="app-search d-none d-md-block me-auto" onSubmit={(e) => e.preventDefault()}>
      <div className="position-relative">
        <input
          type="search"
          id="agency-search"
          className="form-control"
          placeholder="Search Agency"
          autoComplete="off"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <IconifyIcon icon="solar:magnifer-broken" className="search-widget-icon" />
      </div>
    </form>
  );
};

export default SearchForm;
