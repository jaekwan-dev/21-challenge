"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface Challenge {
  id?: number;
  title: string;
  description?: string;
  icon?: string;
  color?: string;
  bgGradient?: string;
  duration?: string;
  difficulty?: string;
  createdAt?: string; // ISO 8601 string
  _count?: { userChallenges: number };
}

const AdminPage = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      const response = await fetch('http://localhost:8080/challenges');
      const data = await response.json();
      setChallenges(data);
    } catch (error) {
      console.error('챌린지 목록을 가져오는데 실패했습니다:', error);
    }
  };

  const handleCreateOrUpdateChallenge = async (challenge: Challenge) => {
    try {
      let response;
      if (challenge.id) {
        // 수정
        response = await fetch(`http://localhost:8080/challenges/${challenge.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: challenge.title, description: challenge.description }),
        });
      } else {
        // 생성
        response = await fetch('http://localhost:8080/challenges', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: challenge.title, description: challenge.description }),
        });
      }

      if (response.ok) {
        fetchChallenges(); // 목록 새로고침
        setIsDialogOpen(false);
        setEditingChallenge(null);
      } else {
        console.error('챌린지 저장 실패:', await response.text());
      }
    } catch (error) {
      console.error('챌린지 저장 중 오류 발생:', error);
    }
  };

  const handleDeleteChallenge = async (id: number) => {
    if (window.confirm('정말로 이 챌린지를 삭제하시겠습니까?')) {
      try {
        const response = await fetch(`http://localhost:8080/challenges/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          fetchChallenges(); // 목록 새로고침
        } else {
          console.error('챌린지 삭제 실패:', await response.text());
        }
      } catch (error) {
        console.error('챌린지 삭제 중 오류 발생:', error);
      }
    }
  };

  const openDialogForCreate = () => {
    setEditingChallenge({
      title: '',
      description: '',
    });
    setIsDialogOpen(true);
  };

  const openDialogForEdit = (challenge: Challenge) => {
    setEditingChallenge(challenge);
    setIsDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-6">챌린지 관리</h1>

        <Button onClick={openDialogForCreate} className="mb-6">새 챌린지 추가</Button>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {challenges.map((challenge) => (
            <Card key={challenge.id} className="shadow-sm">
              <CardHeader>
                <CardTitle>{challenge.title}</CardTitle>
                <CardContent className="text-sm text-gray-600 p-0 mt-2">
                  <p>{challenge.description}</p>
                  {challenge.createdAt && (
                    <p>생성일: {new Date(challenge.createdAt).toLocaleDateString()}</p>
                  )}
                  {challenge._count && (
                    <p>참여자: {challenge._count.userChallenges}명</p>
                  )}
                </CardContent>
              </CardHeader>
              <div className="p-4 flex justify-end space-x-2">
                <Button variant="outline" size="sm" onClick={() => openDialogForEdit(challenge)}>수정</Button>
                <Button variant="destructive" size="sm" onClick={() => handleDeleteChallenge(challenge.id!)}>삭제</Button>
              </div>
            </Card>
          ))}
        </div>

        {isDialogOpen && editingChallenge && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{editingChallenge.id ? '챌린지 수정' : '새 챌린지 추가'}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right">제목</Label>
                  <Input
                    id="title"
                    value={editingChallenge.title}
                    onChange={(e) => setEditingChallenge({ ...editingChallenge, title: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">설명</Label>
                  <Textarea
                    id="description"
                    value={editingChallenge.description || ''}
                    onChange={(e) => setEditingChallenge({ ...editingChallenge, description: e.target.value })}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => handleCreateOrUpdateChallenge(editingChallenge)}>
                  {editingChallenge.id ? '저장' : '추가'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
