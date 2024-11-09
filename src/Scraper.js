import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import $ from 'jquery';
import 'datatables.net-dt/css/dataTables.dataTables.min.css';
import 'datatables.net';

const Scraper = () => {
    const [listings, setListings] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);

    const fetchData = async (pageNum) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.get(`https://the-florida-bar-backend.vercel.app/api/scrape?page=${pageNum}`);
            setListings(response.data.listings);
        } catch (error) {
            console.error("Error fetching data:", error);
            setError('Failed to fetch listings');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchAllData = async () => {
        setIsLoading(true);
        setError(null);
        let allListings = [];
        let currentPage = 1;
        let lastPage = false;

        while (!lastPage) {
            try {
                const response = await axios.get(`https://the-florida-bar-backend.vercel.app/api/scrape?page=${currentPage}`);
                const data = response.data.listings;
                
                allListings = allListings.concat(data);

                // Update condition if no more pages are available
                lastPage = data.length === 0 || currentPage === response.data.totalPages;
                currentPage += 1;

            } catch (error) {
                console.error("Error fetching data:", error);
                setError('Failed to fetch all listings');
                break;
            }
        }
        
        setListings(allListings);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchAllData();
    }, [page]);

    useEffect(() => {
        if (listings.length > 0) {

            // Initialize DataTable
            if ($.fn.dataTable.isDataTable('#listingsTable')) {
                $('#listingsTable').DataTable().destroy();
            }
            $('#listingsTable').DataTable({
                paging: true,
                searching: true,
                ordering: true,
                info: true,
                pageLength: 10
            });
        }
    }, [listings]);


    const downloadExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(listings);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "All Listings");
        XLSX.writeFile(workbook, "AllListingsData.xlsx");
    };

    if (error) return <div>Error: {error}</div>;
    if (isLoading) return <div>Loading...</div>;

    return (
        <div  style={{ padding: '3%', margin: '3%'}}>
            <h1>Authorized House Counsels</h1>
          {/*  <button onClick={() => setPage(page - 1)} disabled={page === 1}>Previous Page</button>
            <button onClick={() => setPage(page + 1)}>Next Page</button> 
    <button onClick={fetchAllData}>Fetch All Pages</button> */}
            <button
                    onClick={downloadExcel}
                    style={{ padding: '10px 20px', backgroundColor: '#28a745', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '5px' }}
                >
                    Download as Excel
                </button>
            
            <table id="listingsTable" style={{ width: '100%', marginTop: '20px', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Image</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Name</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Nickname</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Bar Number</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Practice</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Address</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Office Phone</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Cell Phone</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Email</th>
                    </tr>
                </thead>
                <tbody>
                    {listings.map((listing, index) => (
                        <tr key={index}>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                <img src={listing.imageUrl} alt={listing.name} style={{ width: '50px', height: '50px' }} />
                            </td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{listing.name}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{listing.nickname}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{listing.barNumber}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{listing.practice}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{listing.address}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{listing.officePhone}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{listing.cellPhone}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{listing.email}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Scraper;
