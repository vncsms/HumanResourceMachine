import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Input, Col, Row } from 'antd';

export default function NewChallenges () {

  return (
    <div style={{width: '100%', height: '100%', backgroundColor: 'aliceblue'}}>
      <Col>
        <Row>
          <span>Nome:</span>
          <Input style={{width: 'auto'}} placeholder="Basic usage" />
        </Row>
      </Col>
    </div>
  );
}