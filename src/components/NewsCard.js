import React from 'react';
import styled from 'styled-components';

const Card = styled.div`
  background: #23263a;
  border-radius: 12px;
  overflow: hidden;
  color: #fff;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 20px rgba(0,0,0,0.2);
  }
`;

const Thumbnail = styled.div`
  height: 160px;
  background: linear-gradient(45deg, #23263a 0%, #181a20 100%);
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const Content = styled.div`
  padding: 20px;
`;

const Title = styled.h3`
  margin: 0 0 12px 0;
  font-size: 1.1rem;
  line-height: 1.4;
  color: #fff;
`;

const Meta = styled.div`
  color: #bfc7d5;
  font-size: 14px;
`;

const NewsCard = ({ article }) => {
  const handleClick = () => {
    window.open(article.url || `https://news.ycombinator.com/item?id=${article.id}`, '_blank');
  };

  return (
    <Card onClick={handleClick}>
      <Thumbnail>
        <img 
          src={`https://picsum.photos/seed/${article.id}/400/200`} 
          alt={article.title}
        />
      </Thumbnail>
      <Content>
        <Title>{article.title}</Title>
        <Meta>
          By {article.by} • {new Date(article.time * 1000).toLocaleDateString()}
        </Meta>
      </Content>
    </Card>
  );
};

export default NewsCard; 