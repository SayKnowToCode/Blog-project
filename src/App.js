import Layout from './Layout';
import Home from './Home';
import NewPost from './NewPost';
import PostPage from './PostPage';
import About from './About';
import Missing from './Missing';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import EditPost from './EditPost';
import api from './api/posts'
import useWindowSize from './hooks/useWindowSize';

function App() {

  // const [posts, setPosts] = useState([
  //   {
  //     id: 1,
  //     title: "My First Post",
  //     datetime: "July 01, 2021 11:17:36 AM",
  //     body: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quis consequatur expedita, assumenda similique non optio! Modi nesciunt excepturi corrupti atque blanditiis quo nobis, non optio quae possimus illum exercitationem ipsa!"
  //   },
  //   {
  //     id: 2,
  //     title: "My 2nd Post",
  //     datetime: "July 01, 2021 11:17:36 AM",
  //     body: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quis consequatur expedita, assumenda similique non optio! Modi nesciunt excepturi corrupti atque blanditiis quo nobis, non optio quae possimus illum exercitationem ipsa!"
  //   },
  //   {
  //     id: 3,
  //     title: "My 3rd Post",
  //     datetime: "July 01, 2021 11:17:36 AM",
  //     body: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quis consequatur expedita, assumenda similique non optio! Modi nesciunt excepturi corrupti atque blanditiis quo nobis, non optio quae possimus illum exercitationem ipsa!"
  //   },
  //   {
  //     id: 4,
  //     title: "My Fourth Post",
  //     datetime: "July 01, 2021 11:17:36 AM",
  //     body: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quis consequatur expedita, assumenda similique non optio! Modi nesciunt excepturi corrupti atque blanditiis quo nobis, non optio quae possimus illum exercitationem ipsa!"
  //   }
  // ])

  const [posts,setPosts] = useState([]);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [postTitle, setPostTitle] = useState('');
  const [postBody, setPostBody] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editBody, setEditBody] = useState('');
  const navigate = useNavigate();
  const {width} = useWindowSize();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await api.get('/posts');

        // if(! response.ok)
        // {
        //   throw new Error('');
        // }

        // We dont need to do this as axios itself throws error when there is a prob

        setPosts(response.data)

      } catch (error) {

          if(error.response)
          {
            // If not in the 200 response range
            console.log(error.response.data);
            console.log(error.response.status);
            console.log(error.response.headers);
          }
          else{
            // Possibly no response or a 404 or something else
            console.log(`Error : ${error.message}`);
          }
        
      }   
    }

    fetchPosts();
  },[])


  useEffect(() => {
    const filteredResults = posts.filter((post) =>
      ((post.body).toLowerCase()).includes(search.toLowerCase())
      || ((post.title).toLowerCase()).includes(search.toLowerCase()));

    setSearchResults(filteredResults.reverse());
  }, [posts, search])



  const handleSubmit = async (e) => {
    e.preventDefault();
    const id = posts.length ? posts[posts.length - 1].id + 1 : 1;
    const datetime = format(new Date(), 'MMMM dd, yyyy pp');
    const newPost = { id, title: postTitle, datetime, body: postBody };

    try {
      const response = await api.post('/posts',newPost)

      // const allPosts = [...posts, newPost];
      const allPosts = [...posts, response.data];
      // We will use response.data here although it is essentially same as newPost but now the API has confirmed it with the backend

      setPosts(allPosts);
      setPostTitle('');
      setPostBody('');
      navigate('/');
    } catch (error) {
      console.log(`Error : ${error.message}`);
    }
    
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/posts/${id}`) 
      const postsList = posts.filter(post => post.id !== id);
      setPosts(postsList);
      navigate('/');
    } 
    catch(error) {
      console.log(`Error : ${error.message}`);
    }
  }

  const handleEdit = async (id) => {
    const datetime = format(new Date(), 'MMMM dd, yyyy pp');
    const updatedPost = { id, title: editTitle, datetime, body: editBody };
    try {
      const response = await api.put(`/posts/${id}`, updatedPost);
      setPosts(posts.map(post => post.id === id ? { ...response.data } : post));
      setEditTitle('');
      setEditBody('');
      navigate('/');
    } catch (err) {
      console.log(`Error: ${err.message}`);
    }
  }

  return (
    
      <Routes>

        <Route path="/" element= {
          <Layout
            search={search}
            setSearch={setSearch}
            width={width}
          />
        }>

            <Route index element = {<Home posts={searchResults} /> } />

            <Route path='post'>

              <Route index element = {
                <NewPost
                  handleSubmit={handleSubmit}
                  postTitle={postTitle}
                  setPostTitle={setPostTitle}
                  postBody={postBody}
                  setPostBody={setPostBody}
                  /> } 
                />

              <Route path=":id" element = {<PostPage 
                posts={posts} 
                handleDelete={handleDelete} 
                /> } 
              />

          </Route>

          <Route path="edit/:id" element ={
            <EditPost
              posts={posts}
              handleEdit={handleEdit}
              editTitle={editTitle}
              setEditTitle={setEditTitle}
              editBody={editBody}
              setEditBody={setEditBody}
            /> } />
          
          <Route path="about" element={<About />} />
          <Route path="*" element={<Missing />} />

        </Route>
      </Routes>
      
    
  );
}

export default App;