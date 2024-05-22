import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTable, useSortBy, usePagination } from 'react-table';
import { CSVLink } from 'react-csv';

const Dashboard = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(0);

  useEffect(() => {
    fetchBooks();
  }, [pageSize, pageIndex]);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`https://openlibrary.org/subjects/fiction.json?limit=${pageSize}&offset=${pageIndex * pageSize}`);
      const data = response.data.works.map(work => ({
        ratings_average: work.ratings_average || 'N/A',
        author_name: work.authors[0]?.name || 'Unknown',
        title: work.title,
        first_publish_year: work.first_publish_year,
        subject: work.subject,
        author_birth_date: work.authors[0]?.birth_date || 'Unknown',
        author_top_work: work.title
      }));
      setBooks(data);
    } catch (error) {
      console.error("Error fetching books:", error);
    }
    setLoading(false);
  };

  const columns = React.useMemo(
    () => [
      { Header: 'Average Rating', accessor: 'ratings_average' },
      { Header: 'Author Name', accessor: 'author_name' },
      { Header: 'Title', accessor: 'title' },
      { Header: 'First Publish Year', accessor: 'first_publish_year' },
      { Header: 'Subject', accessor: 'subject' },
      { Header: 'Author Birth Date', accessor: 'author_birth_date' },
      { Header: 'Author Top Work', accessor: 'author_top_work' }
    ],
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
  } = useTable(
    { columns, data: books, initialState: { pageIndex: 0, pageSize: 10 } },
    useSortBy,
    usePagination
  );

return (
    <div>
      <h1>Book Dashboard</h1>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <CSVLink data={books} filename={"books.csv"} className="btn btn-primary" target="_blank">Download CSV</CSVLink>
          <table {...getTableProps()} >
            <thead>
              {headerGroups.map(headerGroup => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map(column => (
                    <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                      {column.render('Header')}
                      {column.isSorted ? (column.isSortedDesc ? ' 🔽' : ' 🔼') : ''}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()}>
              {page.map(row => {
                prepareRow(row);
                return (
                  <tr {...row.getRowProps()}>
                    {row.cells.map(cell => (
                      <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="pagination">
            <button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>{'<<'}</button>
            <button onClick={() => previousPage()} disabled={!canPreviousPage}>{'<'}</button>
            <button onClick={() => nextPage()} disabled={!canNextPage}>{'>'}</button>
            <button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>{'>>'}</button>
            <span>
              Page{' '}
              <strong>
                {pageIndex + 1} of {pageOptions.length}
              </strong>{' '}
            </span>
            <span>
              | Go to page:{' '}
              <input
                type="number"
                defaultValue={pageIndex + 1}
                onChange={e => {
                  const page = e.target.value ? Number(e.target.value) - 1 : 0;
                  gotoPage(page);
                }}
                style={{ width: '100px' }}
              />
            </span>{' '}
            <select
              value={pageSize}
              onChange={e => {
                setPageSize(Number(e.target.value));
              }}
            >
              {[10, 20, 50, 100].map(pageSize => (
                <option key={pageSize} value={pageSize}>
                  Show {pageSize}
                </option>
              ))}
            </select>
          </div>
        </>
      )}
    </div>
  );
  
};

export default Dashboard;
